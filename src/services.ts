import matter from 'gray-matter';
import { copyDir, findFileById, getFiles, searchFilesForId, versionExists } from './internal/utils';
import type { Service } from './types';
import fs from 'node:fs/promises';
import { dirname, join } from 'node:path';

/**
 * Returns a service from EventCatalog.
 *
 * You can optionally specify a version to get a specific version of the service
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { getService } = utils('/path/to/eventcatalog');
 *
 * // Gets the latest version of the event
 * cont event = await getService('InventoryService');
 *
 * // Gets a version of the event
 * cont event = await getService('InventoryService', '0.0.1');
 * ```
 */
export const getService =
  (directory: string) =>
  async (id: string, version?: string): Promise<Service> => {
    const file = await findFileById(directory, id, version);

    if (!file) throw new Error(`No service found for the given id: ${id}` + (version ? ` and version ${version}` : ''));

    const { data, content } = matter.read(file);

    return {
      ...data,
      markdown: content.trim(),
    } as Service;
  };

/**
 * Write an event to EventCatalog.
 *
 * You can optionally overide the path of the event.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { writeService } = utils('/path/to/eventcatalog');
 *
 * // Write a service
 * // Event would be written to services/InventoryService
 * await writeService({
 *   id: 'InventoryService',
 *   name: 'Inventory Service',
 *   version: '0.0.1',
 *   summary: 'Service that handles the inventory',
 *   markdown: '# Hello world',
 * });
 *
 * // Write an event to the catalog but override the path
 * // Event would be written to services/Inventory/InventoryService
 * await writeService({
 *    id: 'InventoryService',
 *    name: 'Inventory Adjusted',
 *    version: '0.0.1',
 *    summary: 'This is a summary',
 *    markdown: '# Hello world',
 * }, { path: "/Inventory/InventoryService"});
 * ```
 */
export const writeService =
  (directory: string) =>
  async (service: Service, options: { path: string } = { path: '' }) => {
    // Get the path
    const path = options.path || `/${service.id}`;
    const exists = await versionExists(directory, service.id, service.version);

    if (exists) {
      throw new Error(`Failed to write service as the version ${service.version} already exists`);
    }

    const { markdown, ...frontmatter } = service;
    const document = matter.stringify(markdown.trim(), frontmatter);
    await fs.mkdir(join(directory, path), { recursive: true });
    await fs.writeFile(join(directory, path, 'index.md'), document);
  };

/**
 * Version a service by it's id.
 *
 * Takes the latest service and moves it to a versioned directory.
 * All files with this service are also versioned. (e.g /services/InventoryService/openapi.yml)
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { versionService } = utils('/path/to/eventcatalog');
 *
 * // moves the latest InventoryService service to a versioned directory
 * // the version within that service is used as the version number.
 * await versionService('InventoryService');
 *
 * ```
 */
export const versionService = (directory: string) => async (id: string) => {
  // Find all the events in the directory
  const files = await getFiles(`${directory}/**/index.md`);
  const matchedFiles = await searchFilesForId(files, id);

  if (matchedFiles.length === 0) {
    throw new Error(`No service found with id: ${id}`);
  }

  // Service that is in the route of the project
  const file = matchedFiles[0];
  const eventDirectory = dirname(file);
  const { data: { version = '0.0.1' } = {} } = matter.read(file);
  const targetDirectory = join(eventDirectory, 'versioned', version);

  await fs.mkdir(targetDirectory, { recursive: true });

  // Copy the service to the versioned directory
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
 * Delete a service at it's given path.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { rmService } = utils('/path/to/eventcatalog');
 *
 * // Removes the service at services/InventoryService
 * await rmService('/InventoryService');
 * ```
 */
export const rmService = (directory: string) => async (path: string) => {
  await fs.rm(join(directory, path), { recursive: true });
};

/**
 * Delete a service by it's id.
 *
 * Optionally specify a version to delete a specific version of the service.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { rmServiceById } = utils('/path/to/eventcatalog');
 *
 * // deletes the latest InventoryService event
 * await rmServiceById('InventoryService');
 *
 * // deletes a specific version of the InventoryService event
 * await rmServiceById('InventoryService', '0.0.1');
 * ```
 */
export const rmServiceById = (directory: string) => async (id: string, version?: string) => {
  // Find all the events in the directory
  const files = await getFiles(`${directory}/**/index.md`);

  const matchedFiles = await searchFilesForId(files, id, version);

  if (matchedFiles.length === 0) {
    throw new Error(`No service found with id: ${id}`);
  }

  await Promise.all(matchedFiles.map((file) => fs.rm(file)));
};

/**
 * Add a file to a service by it's id.
 *
 * Optionally specify a version to add a file to a specific version of the service.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { addFileToService } = utils('/path/to/eventcatalog');
 *
 * // adds a file to the latest InventoryService event
 * await addFileToService('InventoryService', { content: 'Hello world', fileName: 'hello.txt' });
 *
 * // adds a file to a specific version of the InventoryService event
 * await addFileToService('InventoryService', { content: 'Hello world', fileName: 'hello.txt' }, '0.0.1');
 *
 * ```
 */
export const addFileToService =
  (directory: string) => async (id: string, file: { content: string; fileName: string }, version?: string) => {
    const pathToEvent = await findFileById(directory, id, version);
    if (!pathToEvent) throw new Error('Cannot find directory to write file to');
    const contentDirectory = dirname(pathToEvent);
    await fs.writeFile(join(contentDirectory, file.fileName), file.content);
  };