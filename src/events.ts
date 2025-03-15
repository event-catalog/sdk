import fs from 'node:fs/promises';
import { join } from 'node:path';
import { findFileById, getUniqueResourcesById } from './internal/utils';
import type { Domain, Event } from './types';
import {
  addFileToResource,
  getResource,
  getResources,
  rmResourceById,
  versionResource,
  writeResource,
} from './internal/resources';
import { getDomainFromPathToFile } from './domains';
import { getDomainFromService, getServices } from './services';

/**
 * Returns an event from EventCatalog.
 *
 * You can optionally specify a version to get a specific version of the event
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { getEvent } = utils('/path/to/eventcatalog');
 *
 * // Gets the latest version of the event
 * const event = await getEvent('InventoryAdjusted');
 *
 * // Gets a version of the event
 * const event = await getEvent('InventoryAdjusted', '0.0.1');
 * ```
 */
export const getEvent =
  (directory: string) =>
  async (id: string, version?: string): Promise<Event> =>
    getResource(directory, id, version, { type: 'event' }) as Promise<Event>;

/**
 * Returns all events from EventCatalog.
 *
 * You can optionally specify if you want to get the latest version of the events.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { getEvents } = utils('/path/to/eventcatalog');
 *
 * // Gets all events (and versions) from the catalog
 * const events = await getEvents();
 *
 * // Gets all events (only latest version) from the catalog
 * const events = await getEvents({ latestOnly: true });
 * ```
 */
export const getEvents =
  (directory: string) =>
  async (options?: { latestOnly?: boolean }): Promise<Event[]> =>
    getResources(directory, { type: 'events', ...options }) as Promise<Event[]>;

/**
 * Write an event to EventCatalog.
 *
 * You can optionally overide the path of the event.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { writeEvent } = utils('/path/to/eventcatalog');
 *
 * // Write an event to the catalog
 * // Event would be written to events/InventoryAdjusted
 * await writeEvent({
 *   id: 'InventoryAdjusted',
 *   name: 'Inventory Adjusted',
 *   version: '0.0.1',
 *   summary: 'This is a summary',
 *   markdown: '# Hello world',
 * });
 *
 * // Write an event to the catalog but override the path
 * // Event would be written to events/Inventory/InventoryAdjusted
 * await writeEvent({
 *    id: 'InventoryAdjusted',
 *    name: 'Inventory Adjusted',
 *    version: '0.0.1',
 *    summary: 'This is a summary',
 *    markdown: '# Hello world',
 * }, { path: "/Inventory/InventoryAdjusted"});
 *
 * // Write a event to the catalog and override the existing content (if there is any)
 * await writeEvent({
 *    id: 'InventoryAdjusted',
 *    name: 'Inventory Adjusted',
 *    version: '0.0.1',
 *    summary: 'This is a summary',
 *    markdown: '# Hello world',
 * }, { override: true });
 *
 * // Write a event to the catalog and version the previous version
 * // only works if the new version is greater than the previous version
 * await writeEvent({
 *    id: 'InventoryAdjusted',
 *    name: 'Inventory Adjusted',
 *    version: '0.0.1',
 *    summary: 'This is a summary',
 *    markdown: '# Hello world',
 * }, { versionExistingContent: true });
 *
 * ```
 */
export const writeEvent =
  (directory: string) =>
  async (
    event: Event,
    options: { path?: string; override?: boolean; versionExistingContent?: boolean } = { path: '', override: false }
  ) =>
    writeResource(directory, { ...event }, { ...options, type: 'event' });
/**
 * Write an event to a service in EventCatalog.
 *
 * You can optionally override the path of the event.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { writeEventToService } = utils('/path/to/eventcatalog');
 *
 * // Write an event to a given service in the catalog
 * // Event would be written to services/Inventory/events/InventoryAdjusted
 * await writeEventToService({
 *   id: 'InventoryAdjusted',
 *   name: 'Inventory Adjusted',
 *   version: '0.0.1',
 *   summary: 'This is a summary',
 *   markdown: '# Hello world',
 * }, { id: 'Inventory' });
 * ```
 */
export const writeEventToService =
  (directory: string) =>
  async (event: Event, service: { id: string; version?: string }, options: { path: string } = { path: '' }) => {
    let pathForEvent =
      service.version && service.version !== 'latest'
        ? `/${service.id}/versioned/${service.version}/events`
        : `/${service.id}/events`;
    pathForEvent = join(pathForEvent, event.id);
    await writeResource(directory, { ...event }, { ...options, path: pathForEvent, type: 'event' });
  };

/**
 * Delete an event at it's given path.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { rmEvent } = utils('/path/to/eventcatalog');
 *
 * // removes an event at the given path (events dir is appended to the given path)
 * // Removes the event at events/InventoryAdjusted
 * await rmEvent('/InventoryAdjusted');
 * ```
 */
export const rmEvent = (directory: string) => async (path: string) => {
  await fs.rm(join(directory, path), { recursive: true });
};

/**
 * Delete an event by it's id.
 *
 * Optionally specify a version to delete a specific version of the event.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { rmEventById } = utils('/path/to/eventcatalog');
 *
 * // deletes the latest InventoryAdjusted event
 * await rmEventById('InventoryAdjusted');
 *
 * // deletes a specific version of the InventoryAdjusted event
 * await rmEventById('InventoryAdjusted', '0.0.1');
 * ```
 */
export const rmEventById = (directory: string) => async (id: string, version?: string, persistFiles?: boolean) => {
  await rmResourceById(directory, id, version, { type: 'event', persistFiles });
};

/**
 * Version an event by it's id.
 *
 * Takes the latest event and moves it to a versioned directory.
 * All files with this event are also versioned (e.g /events/InventoryAdjusted/schema.json)
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { versionEvent } = utils('/path/to/eventcatalog');
 *
 * // moves the latest InventoryAdjusted event to a versioned directory
 * // the version within that event is used as the version number.
 * await versionEvent('InventoryAdjusted');
 *
 * ```
 */
export const versionEvent = (directory: string) => async (id: string) => versionResource(directory, id);

/**
 * Add a file to an event by it's id.
 *
 * Optionally specify a version to add a file to a specific version of the event.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { addFileToEvent } = utils('/path/to/eventcatalog');
 *
 * // adds a file to the latest InventoryAdjusted event
 * await addFileToEvent('InventoryAdjusted', { content: 'Hello world', fileName: 'hello.txt' });
 *
 * // adds a file to a specific version of the InventoryAdjusted event
 * await addFileToEvent('InventoryAdjusted', { content: 'Hello world', fileName: 'hello.txt' }, '0.0.1');
 *
 * ```
 */
export const addFileToEvent =
  (directory: string) => async (id: string, file: { content: string; fileName: string }, version?: string) =>
    addFileToResource(directory, id, file, version);

/**
 * Add a schema to an event by it's id.
 *
 * Optionally specify a version to add a schema to a specific version of the event.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { addSchemaToEvent } = utils('/path/to/eventcatalog');
 *
 * // JSON schema example
 * const schema = {
 *    "$schema": "http://json-schema.org/draft-07/schema#",
 *    "type": "object",
 *    "properties": {
 *        "name": {
 *        "type": "string"
 *    },
 *    "age": {
 *      "type": "number"
 *    }
 *  },
 *  "required": ["name", "age"]
 * };
 *
 * // adds a schema to the latest InventoryAdjusted event
 * await addSchemaToEvent('InventoryAdjusted', { schema, fileName: 'schema.json' });
 *
 * // adds a file to a specific version of the InventoryAdjusted event
 * await addSchemaToEvent('InventoryAdjusted', { schema, fileName: 'schema.json' }, '0.0.1');
 *
 * ```
 */
export const addSchemaToEvent =
  (directory: string) => async (id: string, schema: { schema: string; fileName: string }, version?: string) => {
    await addFileToEvent(directory)(id, { content: schema.schema, fileName: schema.fileName }, version);
  };

/**
 * Check to see if the catalog has a version for the given event.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { eventHasVersion } = utils('/path/to/eventcatalog');
 *
 * // returns true if version is found for the given event and version (supports semver)
 * await eventHasVersion('InventoryAdjusted', '0.0.1');
 * await eventHasVersion('InventoryAdjusted', 'latest');
 * await eventHasVersion('InventoryAdjusted', '0.0.x');
 *
 * ```
 */
export const eventHasVersion = (directory: string) => async (id: string, version: string) => {
  const file = await findFileById(directory, id, version);
  return !!file;
};

/**
 * Retrieves the domain associated with a given event ID and version.
 *
 * This function first attempts to find the file path of the event within the specified directory.
 * If the event is found within a nested domain structure, it retrieves the domain information.
 * If not, it looks up the producers of the event and retrieves the domain information from the producer services.
 */
export const getDomainFromEvent =
  (directory: string) =>
  async (id: string, version: string): Promise<Domain[] | undefined> => {
    const pathToFile = await findFileById(directory, id, version);
    if (!pathToFile) return undefined;

    const domain = getDomainFromPathToFile(directory)(pathToFile);
    if (domain) return Array.isArray(domain) ? domain : [domain];

    // Look up contract owner (producers)
    const services = await getServices(directory)();
    const producers = services.filter((s) => s.sends?.some((m) => m.id === id && m.version === version));
    if (producers.length === 0) return undefined;

    // Get domain for each producer
    const getDomainFromProducer = getDomainFromService(directory);
    const domains = await Promise.all(producers.map((p) => getDomainFromProducer(p.id, p.version)));
    const sanitizedDomains = domains.flat().filter((d) => d !== undefined);
    if (sanitizedDomains.length === 0) return undefined;

    return getUniqueResourcesById(sanitizedDomains);
  };
