import type { Service, Specifications } from './types';
import fs from 'node:fs/promises';
import { join, dirname } from 'node:path';
import {
  addFileToResource,
  getFileFromResource,
  getResource,
  rmResourceById,
  versionResource,
  writeResource,
  getVersionedDirectory,
} from './internal/resources';
import { findFileById, uniqueVersions } from './internal/utils';

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
 * Write a Service to EventCatalog.
 *
 * You can optionally overide the path of the Service.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { writeService } = utils('/path/to/eventcatalog');
 *
 * // Write a Service
 * // Service would be written to services/InventoryService
 * await writeService({
 *   id: 'InventoryService',
 *   name: 'Inventory Service',
 *   version: '0.0.1',
 *   summary: 'Service that handles the inventory',
 *   markdown: '# Hello world',
 * });
 *
 * // Write a service to the catalog but override the path
 * // Service would be written to services/Inventory/InventoryService
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
    const resource: Service = { ...service };

    if (Array.isArray(service.sends)) {
      resource.sends = uniqueVersions(service.sends);
    }

    if (Array.isArray(service.receives)) {
      resource.receives = uniqueVersions(service.receives);
    }

    return writeResource(directory, resource, { ...options, type: 'service' });
  };

/**
 * Write a versioned service to EventCatalog.
 *
 * You can optionally overide the path of the Service.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { writeVersionedService } = utils('/path/to/eventcatalog');
 *
 * // Write a service
 * // Service would be written to services/InventoryService/versioned/0.0.1
 * await writeVersionedService({
 *   id: 'InventoryService',
 *   name: 'Inventory Service',
 *   version: '0.0.1',
 *   summary: 'Service that handles the inventory',
 *   markdown: '# Hello world',
 * });
 *
 * ```
 */
export const writeVersionedService = (directory: string) => async (service: Service) => {
  const resource: Service = { ...service };
  const path = getVersionedDirectory(service.id, service.version);

  return await writeService(directory)(resource, { path: path });
};

/**
 * Write a service to a domain in EventCatalog.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { writeServiceToDomain } = utils('/path/to/eventcatalog');
 *
 * // Write a service to a domain
 * // Service would be written to domains/Shopping/services/InventoryService
 * await writeServiceToDomain({
 *   id: 'InventoryService',
 *   name: 'Inventory Service',
 *   version: '0.0.1',
 *   summary: 'Service that handles the inventory',
 *   markdown: '# Hello world',
 * }, { id: 'Shopping' });
 * ```
 */
export const writeServiceToDomain =
  (directory: string) =>
  async (
    service: Service,
    domain: { id: string; version?: string; direction?: string },
    options: { path: string } = { path: '' }
  ) => {
    let pathForService =
      domain.version && domain.version !== 'latest'
        ? `/${domain.id}/versioned/${domain.version}/services`
        : `/${domain.id}/services`;
    pathForService = join(pathForService, service.id);

    //
    await writeResource(directory, { ...service }, { ...options, path: pathForService, type: 'service' });
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

/**
 * Returns specification files for a service
 *
 * Optionally specify a version to of the service
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { getSpecificationFilesForService } = utils('/path/to/eventcatalog');
 *
 * // returns a list of specification files for a service
 * await getSpecificationFilesForService('InventoryService', '0.0.1');
 *
 * ```
 */

export const getSpecificationFilesForService = (directory: string) => async (id: string, version?: string) => {
  let service: Service = await getService(directory)(id, version);
  const filePathToService = await findFileById(directory, id, version);

  if (!filePathToService) throw new Error('Cannot find directory of service');

  let specs = [] as any;
  if (service.specifications) {
    const serviceSpecifications = service.specifications;
    const specificationFiles = Object.keys(serviceSpecifications);

    const getSpecs = specificationFiles.map(async (specFile) => {
      const fileName = serviceSpecifications[specFile as keyof Specifications];

      if (!fileName) {
        throw new Error(`Specification file name for ${specFile} is undefined`);
      }
      const rawFile = await getFileFromResource(directory, id, { fileName }, version);

      return { key: specFile, content: rawFile, fileName: fileName, path: join(dirname(filePathToService), fileName) };
    });

    specs = await Promise.all(getSpecs);
  }
  return specs;
};

/**
 * Add an event/command to a service by it's id.
 *
 * Optionally specify a version to add the event to a specific version of the service.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * // Adds an event to the service or command to the service
 * const { addEventToService, addCommandToService } = utils('/path/to/eventcatalog');
 *
 * // Adds a new event (InventoryUpdatedEvent) that the InventoryService will send
 * await addEventToService('InventoryService', 'sends', { event: 'InventoryUpdatedEvent', version: '2.0.0' });
 * * // Adds a new event (OrderComplete) that the InventoryService will receive
 * await addEventToService('InventoryService', 'receives', { event: 'OrderComplete', version: '1.0.0' });
 *
 * // Adds a new command (UpdateInventoryCommand) that the InventoryService will send
 * await addCommandToService('InventoryService', 'sends', { command: 'UpdateInventoryCommand', version: '2.0.0' });
 * // Adds a new command (VerifyInventory) that the InventoryService will receive
 * await addCommandToService('InventoryService', 'receives', { command: 'VerifyInventory', version: '1.0.0' });
 *
 * ```
 */

export const addMessageToService =
  (directory: string) => async (id: string, direction: string, event: { id: string; version: string }, version?: string) => {
    let service: Service = await getService(directory)(id, version);

    if (direction === 'sends') {
      if (service.sends === undefined) {
        service.sends = [];
      }
      // We first check if the event is already in the list
      for (let i = 0; i < service.sends.length; i++) {
        if (service.sends[i].id === event.id && service.sends[i].version === event.version) {
          return;
        }
      }
      service.sends.push({ id: event.id, version: event.version });
    } else if (direction === 'receives') {
      if (service.receives === undefined) {
        service.receives = [];
      }
      // We first check if the event is already in the list
      for (let i = 0; i < service.receives.length; i++) {
        if (service.receives[i].id === event.id && service.receives[i].version === event.version) {
          return;
        }
      }
      service.receives.push({ id: event.id, version: event.version });
    } else {
      throw new Error(`Direction ${direction} is invalid, only 'receives' and 'sends' are supported`);
    }

    await rmServiceById(directory)(id, version);
    await writeService(directory)(service);
  };

/**
 * Check to see if the catalog has a version for the given service.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { serviceHasVersion } = utils('/path/to/eventcatalog');
 *
 * // returns true if version is found for the given event and version (supports semver)
 * await serviceHasVersion('InventoryService', '0.0.1');
 * await serviceHasVersion('InventoryService', 'latest');
 * await serviceHasVersion('InventoryService', '0.0.x');*
 *
 * ```
 */
export const serviceHasVersion = (directory: string) => async (id: string, version: string) => {
  const file = await findFileById(directory, id, version);
  return !!file;
};
