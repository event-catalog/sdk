import { dirname, join } from 'path';
import { copyDir, findFileById, getFiles, searchFilesForId, versionExists } from './utils';
import matter from 'gray-matter';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import { Message, Service, CustomDoc } from '../types';
import { satisfies } from 'semver';
import { lock, unlock } from 'proper-lockfile';

type Resource = Service | Message | CustomDoc;

export const versionResource = async (catalogDir: string, id: string) => {
  // Find all the events in the directory
  const files = await getFiles(`${catalogDir}/**/index.{md,mdx}`);
  const matchedFiles = await searchFilesForId(files, id);

  if (matchedFiles.length === 0) {
    throw new Error(`No event found with id: ${id}`);
  }

  // Event that is in the route of the project
  const file = matchedFiles[0];
  const sourceDirectory = dirname(file);
  const { data: { version = '0.0.1' } = {} } = matter.read(file);
  const targetDirectory = getVersionedDirectory(sourceDirectory, version);

  fsSync.mkdirSync(targetDirectory, { recursive: true });

  // Copy the event to the versioned directory
  await copyDir(catalogDir, sourceDirectory, targetDirectory, (src) => {
    return !src.includes('versioned');
  });

  // Remove all the files in the root of the resource as they have now been versioned
  await fs.readdir(sourceDirectory).then(async (resourceFiles) => {
    await Promise.all(
      resourceFiles.map(async (file) => {
        if (file !== 'versioned') {
          fsSync.rmSync(join(sourceDirectory, file), { recursive: true });
        }
      })
    );
  });
};

export const writeResource = async (
  catalogDir: string,
  resource: Resource,
  options: { path?: string; type: string; override?: boolean; versionExistingContent?: boolean } = {
    path: '',
    type: '',
    override: false,
    versionExistingContent: false,
  }
) => {
  const path = options.path || `/${resource.id}`;
  const fullPath = join(catalogDir, path);

  // Create directory if it doesn't exist
  fsSync.mkdirSync(fullPath, { recursive: true });

  // Create or get lock file path
  const lockPath = join(fullPath, 'index.mdx');

  // Ensure the file exists before attempting to lock it
  if (!fsSync.existsSync(lockPath)) {
    fsSync.writeFileSync(lockPath, '');
  }

  try {
    // Acquire lock with retry
    await lock(lockPath, {
      retries: 5,
      stale: 10000, // 10 seconds
    });

    const exists = await versionExists(catalogDir, resource.id, resource.version);

    if (exists && !options.override) {
      throw new Error(`Failed to write ${resource.id} (${options.type}) as the version ${resource.version} already exists`);
    }

    const { markdown, ...frontmatter } = resource;

    if (options.versionExistingContent && !exists) {
      const currentResource = await getResource(catalogDir, resource.id);

      if (currentResource) {
        if (satisfies(resource.version, `>${currentResource.version}`)) {
          await versionResource(catalogDir, resource.id);
        } else {
          throw new Error(`New version ${resource.version} is not greater than current version ${currentResource.version}`);
        }
      }
    }

    const document = matter.stringify(markdown.trim(), frontmatter);
    fsSync.writeFileSync(lockPath, document);
  } finally {
    // Always release the lock
    await unlock(lockPath).catch(() => {});
  }
};

export const getResource = async (
  catalogDir: string,
  id: string,
  version?: string,
  options?: { type: string }
): Promise<Resource | undefined> => {
  const file = await findFileById(catalogDir, id, version);
  if (!file) return;

  const { data, content } = matter.read(file);

  return {
    ...data,
    markdown: content.trim(),
  } as Resource;
};

export const getResources = async (
  catalogDir: string,
  {
    type,
    latestOnly = false,
    ignore = [],
    pattern = '',
  }: { type: string; pattern?: string; latestOnly?: boolean; ignore?: string[] }
): Promise<Resource[] | undefined> => {
  const ignoreList = latestOnly ? `**/versioned/**` : '';
  const filePattern = pattern || `${catalogDir}/**/${type}/**/index.{md,mdx}`;
  const files = await getFiles(filePattern, [ignoreList, ...ignore]);

  if (files.length === 0) return;

  return files.map((file) => {
    const { data, content } = matter.read(file);
    return {
      ...data,
      markdown: content.trim(),
    } as Resource;
  });
};

export const rmResourceById = async (
  catalogDir: string,
  id: string,
  version?: string,
  options?: { type: string; persistFiles?: boolean }
) => {
  const files = await getFiles(`${catalogDir}/**/index.{md,mdx}`);

  const matchedFiles = await searchFilesForId(files, id, version);

  if (matchedFiles.length === 0) {
    throw new Error(`No ${options?.type || 'resource'} found with id: ${id}`);
  }

  if (options?.persistFiles) {
    await Promise.all(
      matchedFiles.map(async (file) => {
        await fs.rm(file, { recursive: true });
      })
    );
  } else {
    await Promise.all(
      matchedFiles.map(async (file) => {
        const directory = dirname(file);
        await fs.rm(directory, { recursive: true, force: true });
      })
    );
  }
};

export const addFileToResource = async (
  catalogDir: string,
  id: string,
  file: { content: string; fileName: string },
  version?: string
) => {
  const pathToResource = await findFileById(catalogDir, id, version);

  if (!pathToResource) throw new Error('Cannot find directory to write file to');

  fsSync.writeFileSync(join(dirname(pathToResource), file.fileName), file.content);
};

export const getFileFromResource = async (catalogDir: string, id: string, file: { fileName: string }, version?: string) => {
  const pathToResource = await findFileById(catalogDir, id, version);

  if (!pathToResource) throw new Error('Cannot find directory of resource');

  const exists = await fs
    .access(join(dirname(pathToResource), file.fileName))
    .then(() => true)
    .catch(() => false);
  if (!exists) throw new Error(`File ${file.fileName} does not exist in resource ${id} v(${version})`);

  return fsSync.readFileSync(join(dirname(pathToResource), file.fileName), 'utf-8');
};
export const getVersionedDirectory = (sourceDirectory: string, version: any): string => {
  return join(sourceDirectory, 'versioned', version);
};
