import matter from 'gray-matter';
import fs from 'node:fs/promises';
import { join } from 'node:path';
import { dirname } from 'node:path';
import { copyDir, findFileById, getFiles, searchFilesForId, versionExists } from './internal/utils';
import type { Event } from './types';

/**
 * Returns an event from EventCatalog.
 * 
 * You can optionally specify a version to get a specific version of the event.
 * 
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils`;
 * 
 * const { getEvent } = utils('/path/to/eventcatalog');
 * 
 * // Gets the latest version of the event
 * cont event = await getEvent('InventoryAdjusted');
 * 
 * // Gets a version of the event
 * cont event = await getEvent('InventoryAdjusted', '0.0.1');
 * ```
 */
export const getEvent =
  (directory: string) =>
  async (id: string, version?: string): Promise<Event> => {
    const file = await findFileById(directory, id, version);

    if (!file) throw new Error(`No event found for the given id: ${id}` + (version ? ` and version ${version}` : ''));

    const { data, content } = matter.read(file);

    return {
      ...data,
      markdown: content.trim(),
    } as Event;
  };

export const writeEvent =
  (directory: string) =>
  async (event: Event, options: { path: string } = { path: '' }) => {
    // Get the path
    const path = options.path || `/${event.id}`;
    const exists = await versionExists(directory, event.id, event.version);

    if (exists) {
      throw new Error(`Failed to write event as the version ${event.version} already exists`);
    }

    const { markdown, ...frontmatter } = event;
    const document = matter.stringify(markdown.trim(), frontmatter);
    await fs.mkdir(join(directory, path), { recursive: true });
    await fs.writeFile(join(directory, path, 'index.md'), document);
  };

export const rmEvent = (directory: string) => async (path: string) => {
  await fs.rm(join(directory, path), { recursive: true });
};

export const rmEventById = (directory: string) => async (id: string, version?: string) => {
  // Find all the events in the directory
  const files = await getFiles(`${directory}/**/index.md`);

  const matchedFiles = await searchFilesForId(files, id, version);

  if (matchedFiles.length === 0) {
    throw new Error(`No event found with id: ${id}`);
  }

  await Promise.all(matchedFiles.map((file) => fs.rm(file)));
};

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

  await fs.mkdir(targetDirectory, { recursive: true });

  // Copy the event to the versioned directory
  await copyDir(directory, eventDirectory, targetDirectory, (src) => {
    return !src.includes('versioned');
  });

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

export const addFileToEvent =
  (directory: string) => async (id: string, file: { content: string; fileName: string }, version?: string) => {
    const pathToEvent = await findFileById(directory, id, version);
    if (!pathToEvent) throw new Error('Cannot find directory to write file to');
    const contentDirectory = dirname(pathToEvent);
    await fs.writeFile(join(contentDirectory, file.fileName), file.content);
  };

export const addSchemaToEvent =
  (directory: string) => async (id: string, schema: { schema: string; fileName: string }, version?: string) => {
    await addFileToEvent(directory)(id, { content: schema.schema, fileName: schema.fileName }, version);
  };
