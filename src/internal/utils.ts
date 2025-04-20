import { globSync } from 'glob';
import fsSync from 'node:fs';
import { copy, CopyFilterAsync, CopyFilterSync } from 'fs-extra';
import { join, dirname, normalize, sep as pathSeparator, resolve } from 'node:path';
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
    // Normalize the input pattern to use the OS-specific separator
    const normalizedPattern = normalize(pattern);

    // Determine the base directory for glob searching
    // If pattern includes globstar, take the part before it, otherwise take the directory of the pattern
    const baseDir = normalizedPattern.includes('**') ? normalizedPattern.split('**')[0] : dirname(normalizedPattern);
    // Ensure baseDir ends with a separator for correct cwd behavior in glob
    const cwd = baseDir.endsWith(pathSeparator) ? baseDir : `${baseDir}${pathSeparator}`;

    const ignoreList = Array.isArray(ignore) ? ignore : [ignore];

    // Use globSync with the normalized pattern relative to the calculated cwd
    // Pass `absolute: true` to get absolute paths, which avoids issues with relative path resolution
    const files = globSync(normalizedPattern, {
      cwd: resolve(cwd), // Use absolute path for cwd
      ignore: ['node_modules/**', ...ignoreList],
      absolute: true, // Get absolute paths back
      nodir: true, // Ensure we only get files
    });

    // Normalize the returned paths for consistency (though absolute paths should be fine)
    return files.map(normalize);
  } catch (error: any) {
    // Provide more context in the error message
    throw new Error(`Error finding files for pattern "${pattern}": ${error.message}`);
  }
};

export const readMdxFile = async (path: string) => {
  const { data } = matter.read(path);
  const { markdown, ...frontmatter } = data;
  return { ...frontmatter, markdown };
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
