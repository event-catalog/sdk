import type { Domain } from './types';
import fs from 'node:fs/promises';
import { join } from 'node:path';
import {
  addFileToResource,
  getResource,
  getResources,
  rmResourceById,
  versionResource,
  writeResource,
} from './internal/resources';
import { findFileById, uniqueVersions } from './internal/utils';

/**
 * Returns a domain from EventCatalog.
 *
 * You can optionally specify a version to get a specific version of the domain
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { getDomain } = utils('/path/to/eventcatalog');
 *
 * // Gets the latest version of the domain
 * const domain = await getDomain('Payment');
 *
 * // Gets a version of the domain
 * const domain = await getDomain('Payment', '0.0.1');
 * ```
 */
export const getDomain =
  (directory: string) =>
  async (id: string, version?: string): Promise<Domain> =>
    getResource(directory, id, version, { type: 'domain' }) as Promise<Domain>;

/**
 * Returns all domains from EventCatalog.
 *
 * You can optionally specify if you want to get the latest version of the domains.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { getDomains } = utils('/path/to/eventcatalog');
 *
 * // Gets all domains (and versions) from the catalog
 * const domains = await getDomains();
 *
 * // Gets all domains (only latest version) from the catalog
 * const domains = await getDomains({ latestOnly: true });
 * ```
 */
export const getDomains =
  (directory: string) =>
  async (options?: { latestOnly?: boolean }): Promise<Domain[]> =>
    getResources(directory, {
      type: 'domains',
      ignore: ['**/services/**', '**/events/**', '**/commands/**', '**/queries/**'],
      ...options,
    }) as Promise<Domain[]>;

/**
 * Write a domain to EventCatalog.
 *
 * You can optionally overide the path of the domain.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { writeDomain } = utils('/path/to/eventcatalog');
 *
 * // Write a domain
 * // Domain would be written to domains/Payment
 * await writeDomain({
 *   id: 'Payment',
 *   name: 'Payment domain',
 *   version: '0.0.1',
 *   summary: 'Domain for all things to do with payments',
 *   markdown: '# Hello world',
 * });
 *
 * // Write a domain to the catalog but override the path
 * // Domain would be written to domains/Inventory/Payment
 * await writeDomain({
 *    id: 'Payment',
 *    name: 'Inventory Adjusted',
 *    version: '0.0.1',
 *    summary: 'This is a summary',
 *    markdown: '# Hello world',
 * }, { path: "/Inventory/Payment"});
 *
 * // Write a domain to the catalog and override the existing content (if there is any)
 * await writeDomain({
 *    id: 'Payment',
 *    name: 'Inventory Adjusted',
 *    version: '0.0.1',
 *    summary: 'This is a summary',
 *    markdown: '# Hello world',
 * }, { override: true });
 *
 * // Write a domain to the catalog and version the previous version
 * // only works if the new version is greater than the previous version
 * await writeDomain({
 *    id: 'Payment',
 *    name: 'Inventory Adjusted',
 *    version: '0.0.1',
 *    summary: 'This is a summary',
 *    markdown: '# Hello world',
 * }, { versionExistingContent: true });
 *
 * ```
 */
export const writeDomain =
  (directory: string) =>
  async (domain: Domain, options: { path?: string; override?: boolean; versionExistingContent?: boolean } = { path: '' }) => {
    const resource: Domain = { ...domain };

    if (Array.isArray(domain.services)) {
      resource.services = uniqueVersions(domain.services);
    }

    return await writeResource(directory, resource, { ...options, type: 'domain' });
  };

/**
 * Version a domain by it's id.
 *
 * Takes the latest domain and moves it to a versioned directory.
 * All files with this domain are also versioned. (e.g /domains/Payment/openapi.yml)
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { versionDomain } = utils('/path/to/eventcatalog');
 *
 * // moves the latest Payment domain to a versioned directory
 * // the version within that domain is used as the version number.
 * await versionDomain('Payment');
 *
 * ```
 */
export const versionDomain = (directory: string) => async (id: string) => versionResource(directory, id);

/**
 * Delete a domain at it's given path.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { rmDomain } = utils('/path/to/eventcatalog');
 *
 * // Removes the domain at domains/Payment
 * await rmDomain('/Payment');
 * ```
 */
export const rmDomain = (directory: string) => async (path: string) => {
  await fs.rm(join(directory, path), { recursive: true });
};

/**
 * Delete a domain by it's id.
 *
 * Optionally specify a version to delete a specific version of the domain.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { rmDomainById } = utils('/path/to/eventcatalog');
 *
 * // deletes the latest Payment event
 * await rmDomainById('Payment');
 *
 * // deletes a specific version of the Payment event
 * await rmDomainById('Payment', '0.0.1');
 * ```
 */
export const rmDomainById = (directory: string) => async (id: string, version?: string, persistFiles?: boolean) =>
  rmResourceById(directory, id, version, { type: 'domain', persistFiles });

/**
 * Add a file to a domain by it's id.
 *
 * Optionally specify a version to add a file to a specific version of the domain.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { addFileToDomain } = utils('/path/to/eventcatalog');
 *
 * // adds a file to the latest Payment event
 * await addFileToDomain('Payment', { content: 'Hello world', fileName: 'hello.txt' });
 *
 * // adds a file to a specific version of the Payment event
 * await addFileToDomain('Payment', { content: 'Hello world', fileName: 'hello.txt' }, '0.0.1');
 *
 * ```
 */

export const addFileToDomain =
  (directory: string) => async (id: string, file: { content: string; fileName: string }, version?: string) =>
    addFileToResource(directory, id, file, version);

/**
 * Check to see if the catalog has a version for the given domain.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { domainHasVersion } = utils('/path/to/eventcatalog');
 *
 * // returns true if version is found for the given event and version (supports semver)
 * await domainHasVersion('Orders', '0.0.1');
 * await domainHasVersion('Orders', 'latest');
 * await domainHasVersion('Orders', '0.0.x');*
 *
 * ```
 */
export const domainHasVersion = (directory: string) => async (id: string, version: string) => {
  const file = await findFileById(directory, id, version);
  return !!file;
};

/**
 * Add a service to a domain by it's id.
 *
 * Optionally specify a version to add the service to a specific version of the domain.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * // Adds a service to the domain
 * const { addServiceToDomain } = utils('/path/to/eventcatalog');
 *
 * // Adds a service (Orders Service) to the domain (Orders)
 * await addServiceToDomain('Orders', { service: 'Order Service', version: '2.0.0' });
 * // Adds a service (Orders Service) to the domain (Orders) with a specific version
 * await addServiceToDomain('Orders', { service: 'Order Service', version: '2.0.0' }, '1.0.0');
 * ```
 */

export const addServiceToDomain =
  (directory: string) => async (id: string, service: { id: string; version: string }, version?: string) => {
    let domain: Domain = await getDomain(directory)(id, version);

    if (domain.services === undefined) {
      domain.services = [];
    }

    const serviceExistsInList = domain.services.some((s) => s.id === service.id && s.version === service.version);

    if (serviceExistsInList) {
      return;
    }

    // Add service to the list
    domain.services.push(service);

    await rmDomainById(directory)(id, version, true);
    await writeDomain(directory)(domain);
  };
