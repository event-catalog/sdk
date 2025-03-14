import { glob, globSync } from 'glob';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import { copy, copySync, CopyFilterAsync, CopyFilterSync } from 'fs-extra';
import { join } from 'node:path';
import matter from 'gray-matter';
import { satisfies, validRange, valid } from 'semver';

/**
 * Returns true if a given version of a resource id exists in the catalog
 */
export const versionExists = async (catalogDir: string, id: string, version: string) => {
  const files = await getFiles(`${catalogDir}/**/index.{md,mdx}`);
  const matchedFiles = (await searchFilesForId(files, id, version)) || [];
  return matchedFiles.length > 0;
};

export const findFileById = async (catalogDir: string, id: string, version?: string): Promise<string | undefined> => {
  const files = await getFiles(`${catalogDir}/**/index.{md,mdx}`);

  const matchedFiles = (await searchFilesForId(files, id)) || [];
  const latestVersion = matchedFiles.find((path) => !path.includes('versioned'));

  // If no version is provided, return the latest version
  if (!version) {
    return latestVersion;
  }

  // map files into gray matter to get versions
  const parsedFiles = matchedFiles.map((path) => {
    const { data } = matter.read(path);
    return { ...data, path };
  }) as any[];

  const semverRange = validRange(version);

  if (semverRange && valid(version)) {
    const match = parsedFiles.filter((c) => satisfies(c.version, semverRange));
    return match.length > 0 ? match[0].path : undefined;
  }

  // Order by version
  const sorted = parsedFiles.sort((a, b) => {
    return a.version.localeCompare(b.version);
  });

  // latest version
  const match = sorted.length > 0 ? [sorted[sorted.length - 1]] : [];

  if (match.length > 0) {
    return match[0].path;
  }
};

export const getFiles = async (pattern: string, ignore: string | string[] = '') => {
  try {
    const ignoreList = Array.isArray(ignore) ? ignore : [ignore];
    const files = globSync(pattern, { ignore: ['node_modules/**', ...ignoreList] });
    return files;
  } catch (error) {
    throw new Error(`Error finding files: ${error}`);
  }
};

export const searchFilesForId = async (files: string[], id: string, version?: string) => {
  const idRegex = new RegExp(`^id:\\s*(['"]|>-)?\\s*${id}['"]?\\s*$`, 'm');
  const versionRegex = new RegExp(`^version:\\s*['"]?${version}['"]?\\s*$`, 'm');

  const matches = files.map((file) => {
    const content = fsSync.readFileSync(file, 'utf-8');
    const hasIdMatch = content.match(idRegex);

    // Check version if provided
    if (version && !content.match(versionRegex)) {
      return undefined;
    }

    if (hasIdMatch) {
      return file;
    }
  });

  return matches.filter(Boolean).filter((file) => file !== undefined);
};

/**
 * Function to copy a directory from source to target, uses a tmp directory
 * @param catalogDir
 * @param source
 * @param target
 * @param filter
 */
export const copyDir = async (catalogDir: string, source: string, target: string, filter?: CopyFilterAsync | CopyFilterSync) => {
  const tmpDirectory = join(catalogDir, 'tmp');
  fsSync.mkdirSync(tmpDirectory, { recursive: true });

  // Copy everything over
  await copy(source, tmpDirectory, {
    overwrite: true,
    filter,
  });

  await copy(tmpDirectory, target, {
    overwrite: true,
    filter,
  });

  // Remove the tmp directory
  fsSync.rmSync(tmpDirectory, { recursive: true });
};

// Makes sure values in sends/recieves are unique
export const uniqueVersions = (messages: { id: string; version: string }[]): { id: string; version: string }[] => {
  const uniqueSet = new Set();

  return messages.filter((message) => {
    const key = `${message.id}-${message.version}`;
    if (!uniqueSet.has(key)) {
      uniqueSet.add(key);
      return true;
    }
    return false;
  });
};
