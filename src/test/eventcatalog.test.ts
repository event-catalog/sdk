
import utils from '../index';
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, it, expect } from 'vitest';

const CATALOG_PATH = path.join(__dirname, 'catalog-eventcatalog');

const {
    dumpCatalog,
} = utils(CATALOG_PATH);


// clean the catalog before each test
beforeEach(() => {
    // fs.rmSync(CATALOG_PATH, { recursive: true, force: true });
    // fs.mkdirSync(CATALOG_PATH, { recursive: true });
});

afterEach(() => {
    // fs.rmSync(CATALOG_PATH, { recursive: true, force: true });
});

describe('EventCatalog', () => {
    describe('dumpCatalog', () => {
        it('the dump file should contain the catalog version, dump version and the createdAt date', async () => {
            const dump = await dumpCatalog();
            expect(dump.catalogVersion).toBe('2.33.5');
            expect(dump.version).toBe('0.0.1');
            expect(dump.createdAt).toBeDefined();
        });
    });
});
