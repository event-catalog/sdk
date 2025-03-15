import fs from 'node:fs/promises';
import { join } from 'node:path';
import { findFileById, getUniqueResourcesById } from './internal/utils';
import type { Domain, Query } from './types';
import {
  addFileToResource,
  getResource,
  getResources,
  rmResourceById,
  versionResource,
  writeResource,
} from './internal/resources';
import { getDomainFromPathToFile } from './domains';
import { getServices, getDomainFromService } from './services';

/**
 * Returns a query from EventCatalog.
 *
 * You can optionally specify a version to get a specific version of the query
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { getQuery } = utils('/path/to/eventcatalog');
 *
 * // Gets the latest version of the event
 * const event = await getQuery('GetOrder');
 *
 * // Gets a version of the event
 * const event = await getQuery('GetOrder', '0.0.1');
 * ```
 */
export const getQuery =
  (directory: string) =>
  async (id: string, version?: string): Promise<Query> =>
    getResource(directory, id, version, { type: 'query' }) as Promise<Query>;

/**
 * Write a query to EventCatalog.
 *
 * You can optionally override the path of the query.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { writeQuery } = utils('/path/to/eventcatalog');
 *
 * // Write an event to the catalog
 * // Event would be written to queries/GetOrder
 * await writeQuery({
 *   id: 'GetOrder',
 *   name: 'Get Order',
 *   version: '0.0.1',
 *   summary: 'This is a summary',
 *   markdown: '# Hello world',
 * });
 *
 * // Write an event to the catalog but override the path
 * // Event would be written to queries/Inventory/GetOrder
 * await writeQuery({
 *    id: 'GetOrder',
 *    name: 'Get Order',
 *    version: '0.0.1',
 *    summary: 'This is a summary',
 *    markdown: '# Hello world',
 * }, { path: "/Orders/GetOrder"});
 *
 * // Write a query to the catalog and override the existing content (if there is any)
 * await writeQuery({
 *    id: 'GetOrder',
 *    name: 'Get Order',
 *    version: '0.0.1',
 *    summary: 'This is a summary',
 *    markdown: '# Hello world',
 * }, { override: true });
 *
 * // Write a query to the catalog and version the previous version
 * // only works if the new version is greater than the previous version
 * await writeQuery({
 *    id: 'GetOrder',
 *    name: 'Get Order',
 *    version: '0.0.1',
 *    summary: 'This is a summary',
 *    markdown: '# Hello world',
 * }, { versionExistingContent: true });
 *
 * ```
 */
export const writeQuery =
  (directory: string) =>
  async (query: Query, options: { path?: string; override?: boolean; versionExistingContent?: boolean } = { path: '' }) =>
    writeResource(directory, { ...query }, { ...options, type: 'query' });

/**
 * Returns all queries from EventCatalog.
 *
 * You can optionally specify if you want to get the latest version of the queries.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { getQueries } = utils('/path/to/eventcatalog');
 *
 * // Gets all queries (and versions) from the catalog
 * const queries = await getQueries();
 *
 * // Gets all queries (only latest version) from the catalog
 * const queries = await getQueries({ latestOnly: true });
 * ```
 */
export const getQueries =
  (directory: string) =>
  async (options: { latestOnly?: boolean }): Promise<Query[]> =>
    getResources(directory, { type: 'queries', ...options }) as Promise<Query[]>;

/**
 * Write a query to a service in EventCatalog.
 *
 * You can optionally override the path of the event.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { writeQueryToService } = utils('/path/to/eventcatalog');
 *
 * // Write an event to a given service in the catalog
 * // Event would be written to services/Orders/queries/GetOrder
 * await writeQueryToService({
 *   id: 'GetOrder',
 *   name: 'Get Order',
 *   version: '0.0.1',
 *   summary: 'This is a summary',
 *   markdown: '# Hello world',
 * }, { id: 'Orders' });
 * ```
 */
export const writeQueryToService =
  (directory: string) =>
  async (query: Query, service: { id: string; version?: string }, options: { path: string } = { path: '' }) => {
    let pathForQuery =
      service.version && service.version !== 'latest'
        ? `/${service.id}/versioned/${service.version}/queries`
        : `/${service.id}/queries`;
    pathForQuery = join(pathForQuery, query.id);
    await writeResource(directory, { ...query }, { ...options, path: pathForQuery, type: 'query' });
  };

/**
 * Delete a query at it's given path.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { rmQuery } = utils('/path/to/eventcatalog');
 *
 * // removes an query at the given path (queries dir is appended to the given path)
 * // Removes the query at queries/GetOrders
 * await rmQuery('/GetOrders');
 * ```
 */
export const rmQuery = (directory: string) => async (path: string) => {
  await fs.rm(join(directory, path), { recursive: true });
};

/**
 * Delete a query by it's id.
 *
 * Optionally specify a version to delete a specific version of the query.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { rmQueryById } = utils('/path/to/eventcatalog');
 *
 * // deletes the latest InventoryAdjusted query
 * await rmQueryById('GetOrder');
 *
 * // deletes a specific version of the GetOrder query
 * await rmQueryById('GetOrder', '0.0.1');
 * ```
 */
export const rmQueryById = (directory: string) => async (id: string, version?: string, persistFiles?: boolean) => {
  await rmResourceById(directory, id, version, { type: 'query', persistFiles });
};

/**
 * Version a query by it's id.
 *
 * Takes the latest query and moves it to a versioned directory.
 * All files with this query are also versioned (e.g /queries/GetOrder/schema.json)
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { versionQuery } = utils('/path/to/eventcatalog');
 *
 * // moves the latest GetOrder query to a versioned directory
 * // the version within that query is used as the version number.
 * await versionQuery('GetOrder');
 *
 * ```
 */
export const versionQuery = (directory: string) => async (id: string) => versionResource(directory, id);

/**
 * Add a file to a query by it's id.
 *
 * Optionally specify a version to add a file to a specific version of the query.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { addFileToQuery } = utils('/path/to/eventcatalog');
 *
 * // adds a file to the latest GetOrder query
 * await addFileToQuery('GetOrder', { content: 'Hello world', fileName: 'hello.txt' });
 *
 * // adds a file to a specific version of the GetOrder query
 * await addFileToQuery('GetOrder', { content: 'Hello world', fileName: 'hello.txt' }, '0.0.1');
 *
 * ```
 */
export const addFileToQuery =
  (directory: string) => async (id: string, file: { content: string; fileName: string }, version?: string) =>
    addFileToResource(directory, id, file, version);

/**
 * Add a schema to a query by it's id.
 *
 * Optionally specify a version to add a schema to a specific version of the query.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { addSchemaToQuery } = utils('/path/to/eventcatalog');
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
 * // adds a schema to the latest GetOrder query
 * await addSchemaToQuery('GetOrder', { schema, fileName: 'schema.json' });
 *
 * // adds a file to a specific version of the GetOrder query
 * await addSchemaToQuery('GetOrder', { schema, fileName: 'schema.json' }, '0.0.1');
 *
 * ```
 */
export const addSchemaToQuery =
  (directory: string) => async (id: string, schema: { schema: string; fileName: string }, version?: string) => {
    await addFileToQuery(directory)(id, { content: schema.schema, fileName: schema.fileName }, version);
  };

/**
 * Check to see if the catalog has a version for the given query.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { queryHasVersion } = utils('/path/to/eventcatalog');
 *
 * // returns true if version is found for the given event and version (supports semver)
 * await queryHasVersion('GetOrder', '0.0.1');
 * await queryHasVersion('GetOrder', 'latest');
 * await queryHasVersion('GetOrder', '0.0.x');*
 *
 * ```
 */
export const queryHasVersion = (directory: string) => async (id: string, version: string) => {
  const file = await findFileById(directory, id, version);
  return !!file;
};

/**
 * Retrieves the domain associated with a given query ID and version.
 *
 * This function first attempts to find the file path of the query within the specified directory.
 * If the query is found within a nested domain structure, it retrieves the domain information.
 * If not, it looks up the receivers of the query and retrieves the domain information from the receiver services.
 */
export const getDomainFromQuery =
  (directory: string) =>
  async (id: string, version: string): Promise<Domain[] | undefined> => {
    const pathToFile = await findFileById(directory, id, version);
    if (!pathToFile) return undefined;

    const domain = getDomainFromPathToFile(directory)(pathToFile);
    if (domain) return Array.isArray(domain) ? domain : [domain];

    // Look up contract owner (receiver)
    const services = await getServices(directory)();
    const receivers = services.filter((s) => s.receives?.some((m) => m.id === id && m.version === version));
    if (receivers.length === 0) return undefined;

    // Get domain for each receiver
    const getDomainFromReceiver = getDomainFromService(directory);
    const domains = await Promise.all(receivers.map((p) => getDomainFromReceiver(p.id, p.version)));
    const sanitizedDomains = domains.flat().filter((d) => d !== undefined);
    if (sanitizedDomains.length === 0) return undefined;

    return getUniqueResourcesById(sanitizedDomains);
  };
