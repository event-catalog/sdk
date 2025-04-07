import type { Domain, UbiquitousLanguageDictionary } from './types';
import fs from 'node:fs/promises';
import { join } from 'node:path';
import { getDomains } from './domains';

export type EventCatalogObject = {
  version: string;
  catalogVersion: string;
  resources: {
    domains: Domain[];
  };
};

const DUMP_VERSION = '0.0.1';

const getEventCatalogVersion = async (catalogDir: string) => {
  // Read package.json in the catalogDir
  const packageJson = await fs.readFile(join(catalogDir, 'package.json'), 'utf8');
  const packageJsonObject = JSON.parse(packageJson);
  return packageJsonObject['dependencies']['@eventcatalog/core'];
}

/**
 * Dumps the catalog to a JSON file.
 *
 * @param directory - The directory of the catalog.
 * @returns A JSON file with the catalog.
 */
export const dumpCatalog = (directory: string) => async () => {

    const domains = await getDomains(directory)();
    console.log(domains);

    return {
        version: DUMP_VERSION,
        catalogVersion: await getEventCatalogVersion(directory),
        createdAt: new Date().toISOString(),
        resources: {
            domains: [],
        },
    }
  // Returns a JSON file with the catalog
};

/**
 * Things to dump
 * 
 * - domains
 * - services
 * - channels
 * - teams
 * - users
 * - ubiquitous language
 * - custom docs
 * - docs
 * - queries
 * - events
 * - channels
 * 
 */