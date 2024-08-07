import type { Service } from './types';
import fs from 'node:fs/promises';
import { join } from 'node:path';
import { addFileToResource, getResource, rmResourceById, versionResource, writeResource } from './internal/resources';

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
 * const service = await getService('InventoryService');
 *
 * // Gets a version of the event
 * const service = await getService('InventoryService', '0.0.1');
 * ```
 */
export const getService =
  (directory: string) =>
  async (id: string, version?: string): Promise<Service> =>
    getResource(directory, id, version, { type: 'service' }) as Promise<Service>;
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
  async (service: Service, options: { path: string } = { path: '' }) =>
    writeResource(directory, { ...service }, { ...options, type: 'service' });

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
export const versionService = (directory: string) => async (id: string) => versionResource(directory, id);

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
export const rmServiceById = (directory: string) => async (id: string, version?: string) =>
  rmResourceById(directory, id, version, { type: 'service' });

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
  (directory: string) => async (id: string, file: { content: string; fileName: string }, version?: string) =>
    addFileToResource(directory, id, file, version);
