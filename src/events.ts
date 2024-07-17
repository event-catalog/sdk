import matter from 'gray-matter';
import fs from 'node:fs/promises';
import { join } from 'node:path';
import { dirname } from 'node:path';
import { copyDir, findFileById, getFiles, searchFilesForId, versionExists } from './internal/utils';
import type { Event } from './types';

/**
 * Returns an events from EventCatalog
 * @param id - The id of the event to retrieve
 * @param version - Optional id of the version to get
 * @returns
 */
export const getEvent =
  (directory: string) =>
  async (id: string, version?: string): Promise<Event> => {
    const file = await findFileById(directory, id, version);

    if (!file)
      throw new Error(
        `No event found for the given id: ${id}` + (version ? ` and version ${version}` : '')
      );

    const { data, content } = matter.read(file);

    return {
      ...data,
      markdown: content.trim(),
    } as Event;
  };

/**
 * Adds an event to EventCatalog
 *
 * @param event - The event to write
 * @param options - Optional options to write the event
 *
 */
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

/**
 * Remove an event to EventCatalog (modeled on the standard POSIX rm utility)
 *
 * @param path - The path to your event, e.g. `/Inventory/InventoryAdjusted`
 *
 */
export const rmEvent = (directory: string) => async (path: string) => {
  await fs.rm(join(directory, path), { recursive: true });
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

/**
 * Adds a file to the given event
 * @param id - The id of the event to add the file to
 * @param file - File contents to add including the content and the file name
 * @param version - Optional version of the event to add the file to
 * @returns
 */
export const addFileToEvent =
  (directory: string) =>
  async (id: string, file: { content: string; fileName: string }, version?: string) => {
    const pathToEvent = await findFileById(directory, id, version);
    if (!pathToEvent) throw new Error('Cannot find directory to write file to');
    const contentDirectory = dirname(pathToEvent);
    await fs.writeFile(join(contentDirectory, file.fileName), file.content);
  };

/**
 * Adds a schema to the given event
 * @param id - The id of the event to add the schema to
 * @param schema - Schema contents to add including the content and the file name
 * @param version - Optional version of the event to add the schema to
 * @returns
 */
export const addSchemaToEvent =
  (directory: string) =>
  async (id: string, schema: { schema: string; fileName: string }, version?: string) => {
    await addFileToEvent(directory)(id, { content: schema.schema, fileName: schema.fileName }, version);
  };
