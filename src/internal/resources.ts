import { dirname, join } from 'path';
import { copyDir, findFileById, getFiles, searchFilesForId, versionExists } from './utils';
import matter from 'gray-matter';
import fs from 'node:fs/promises';
import { Message, Service } from '../types';

type Resource = Service | Message;

export const versionResource = async (catalogDir: string, id: string) => {
  // Find all the events in the directory
  const files = await getFiles(`${catalogDir}/**/index.md`);
  const matchedFiles = await searchFilesForId(files, id);

  if (matchedFiles.length === 0) {
    throw new Error(`No event found with id: ${id}`);
  }

  // Event that is in the route of the project
  const file = matchedFiles[0];
  const sourceDirectory = dirname(file);
  const { data: { version = '0.0.1' } = {} } = matter.read(file);
  const targetDirectory = join(sourceDirectory, 'versioned', version);

  await fs.mkdir(targetDirectory, { recursive: true });

  // Copy the event to the versioned directory
  await copyDir(catalogDir, sourceDirectory, targetDirectory, (src) => {
    return !src.includes('versioned');
  });

  // Remove all the files in the root of the resource as they have now been versioned
  await fs.readdir(sourceDirectory).then(async (resourceFiles) => {
    await Promise.all(
      resourceFiles.map(async (file) => {
        if (file !== 'versioned') {
          await fs.rm(join(sourceDirectory, file), { recursive: true });
        }
      })
    );
  });
};

export const writeResource = async (
  catalogDir: string,
  resource: Resource,
  options: { path: string; type: string } = { path: '', type: '' }
) => {
  // Get the path
  const path = options.path || `/${resource.id}`;
  const exists = await versionExists(catalogDir, resource.id, resource.version);

  if (exists) {
    throw new Error(`Failed to write ${options.type} as the version ${resource.version} already exists`);
  }

  const { markdown, ...frontmatter } = resource;
  const document = matter.stringify(markdown.trim(), frontmatter);
  await fs.mkdir(join(catalogDir, path), { recursive: true });
  await fs.writeFile(join(catalogDir, path, 'index.md'), document);
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

export const rmResourceById = async (catalogDir: string, id: string, version?: string, options?: { type: string }) => {
  const files = await getFiles(`${catalogDir}/**/index.md`);
  const matchedFiles = await searchFilesForId(files, id, version);

  if (matchedFiles.length === 0) {
    throw new Error(`No ${options?.type || 'resource'} found with id: ${id}`);
  }

  await Promise.all(matchedFiles.map((file) => fs.rm(file)));
};

export const addFileToResource = async (
  catalogDir: string,
  id: string,
  file: { content: string; fileName: string },
  version?: string
) => {
  const pathToResource = await findFileById(catalogDir, id, version);

  if (!pathToResource) throw new Error('Cannot find directory to write file to');

  await fs.writeFile(join(dirname(pathToResource), file.fileName), file.content);
};

export const getFileFromResource = async (catalogDir: string, id: string, file: { fileName: string }, version?: string) => {
  const pathToResource = await findFileById(catalogDir, id, version);

  if (!pathToResource) throw new Error('Cannot find directory of resource');

  const exists = await fs
    .access(join(dirname(pathToResource), file.fileName))
    .then(() => true)
    .catch(() => false);
  if (!exists) throw new Error(`File ${file.fileName} does not exist in resource ${id} v(${version})`);

  return fs.readFile(join(dirname(pathToResource), file.fileName), 'utf-8');
};
