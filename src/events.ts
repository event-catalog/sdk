import matter from 'gray-matter';
import fs from 'node:fs/promises';
import { join } from 'node:path';
import { glob } from 'glob';
import { dirname } from 'node:path';
import { copy, remove } from 'fs-extra';

type Badge = {
  content: string;
  backgroundColor: string;
  textColor: string;
};

type Event = {
  id: string;
  name: string;
  version: string;
  summary: string;
  owners?: string[];
  badges?: Badge[];
  // Path to the schema file.
  schemaPath?: string;
  // Markdown content of the event
  markdown: string;
};

/**
 * Adds an event to EventCatalog
 *
 * @param path - The path to your event, e.g. `/Inventory/InventoryAdjusted`
 * @param event - The event to write
 *
 */
export const writeEvent = (directory: string) => async (path: string, event: Event) => {
  const { markdown, ...frontmatter } = event;
  const document = matter.stringify(markdown.trim(), frontmatter);
  await fs.mkdir(join(directory, path), { recursive: true });
  await fs.writeFile(join(directory, path, 'index.md'), document);
};

/**
 * Remove an event to EventCatalog (modeled on the standard POSIX rm utility)
 *
 * @param path - The path to your event, e.g. `/Inventory/InventoryAdjusted`
 *
 */
export const rmEvent = (directory: string) => async (path: string) => {
  await fs.rm(join(directory, path), { recursive: true });
};

const getFiles = async (pattern: string) => {
  try {
    const files = await glob(pattern, { ignore: 'node_modules/**' });
    return files;
  } catch (error) {
    throw new Error(`Error finding files: ${error}`);
  }
};

const searchFilesForId = async (files: string[], id: string, version?: string) => {
  const idRegex = new RegExp(`^id:\\s*['"]?${id}['"]?\\s*$`, 'm');
  const versionRegex = new RegExp(`^version:\\s*['"]?${version}['"]?\\s*$`, 'm');

  const matches = await Promise.all(
    files.map(async (file) => {
      const content = await fs.readFile(file, 'utf-8');
      const hasIdMatch = content.match(idRegex);

      // Check version if provided
      if (version && !content.match(versionRegex)) {
        return undefined;
      }

      if (hasIdMatch) {
        return file;
      }
    })
  );

  return matches.filter(Boolean).filter((file) => file !== undefined);
};

/**
 * Remove an event by an Event id
 *
 * @param id - The id of the event you want to remove
 *
 */
export const rmEventById = (directory: string) => async (id: string, version?: string) => {
  // Find all the events in the directory
  const files = await getFiles(`${directory}/**/index.md`);

  const matchedFiles = await searchFilesForId(files, id, version);

  if (matchedFiles.length === 0) {
    throw new Error(`No event found with id: ${id}`);
  }

  await Promise.all(matchedFiles.map((file) => fs.rm(file)));
};

/**
 * Moves a given event id to the version directory
 * @param directory
 */
export const versionEvent = (directory: string) => async (id: string) => {
  // Find all the events in the directory
  const files = await getFiles(`${directory}/**/index.md`);
  const matchedFiles = await searchFilesForId(files, id);

  if (matchedFiles.length === 0) {
    throw new Error(`No event found with id: ${id}`);
  }

  // Event that is in the route of the project
  const file = matchedFiles[0];
  const eventDirectory = dirname(file);
  const { data: { version = '0.0.1' } = {} } = matter.read(file);
  const targetDirectory = join(eventDirectory, 'versioned', version);
  const tmpDirectory = join(directory, 'tmp');

  await fs.mkdir(targetDirectory, { recursive: true });
  await fs.mkdir(tmpDirectory, { recursive: true });

  // Copy everything over
  await copy(eventDirectory, tmpDirectory, {
    overwrite: true,
    filter: (src) => {
      return !src.includes('versioned');
    },
  });

  await copy(tmpDirectory, targetDirectory, {
    overwrite: true,
    filter: (src) => {
      return !src.includes('versioned');
    },
  });

  // Remove the tmp directory
  await fs.rm(tmpDirectory, { recursive: true });

  // Remove all the files in the root of the resource as they have now been versioned
  await fs.readdir(eventDirectory).then(async (resourceFiles) => {
    await Promise.all(
      resourceFiles.map(async (file) => {
        if (file !== 'versioned') {
          await fs.rm(join(eventDirectory, file), { recursive: true });
        }
      })
    );
  });
};
