// sum.test.js
import { expect, it, describe, beforeEach, afterEach } from 'vitest';
import utils from '../index';
import path from 'node:path';
import fs from 'node:fs';

const CATALOG_PATH = path.join(__dirname, 'catalog-services');

const { writeService, getService, versionService, rmService, rmServiceById, addFileToService } = utils(CATALOG_PATH);

// clean the catalog before each test
beforeEach(() => {
  fs.rmSync(CATALOG_PATH, { recursive: true, force: true });
  fs.mkdirSync(CATALOG_PATH, { recursive: true });
});

afterEach(() => {
  fs.rmSync(CATALOG_PATH, { recursive: true, force: true });
});

describe('Services SDK', () => {
  describe('getService', () => {
    it('returns the given service id from EventCatalog and the latest version when no version is given,', async () => {
      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service tat handles the inventory',
        markdown: '# Hello world',
      });

      const test = await getService('InventoryService');

      expect(test).toEqual({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service tat handles the inventory',
        markdown: '# Hello world',
      });
    });

    it('returns the given service id from EventCatalog and the requested version when a version is given,', async () => {
      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service tat handles the inventory',
        markdown: '# Hello world',
      });

      await versionService('InventoryService');

      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '1.0.0',
        summary: 'Service tat handles the inventory',
        markdown: '# Hello world',
      });

      const test = await getService('InventoryService', '0.0.1');

      expect(test).toEqual({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service tat handles the inventory',
        markdown: '# Hello world',
      });
    });

    it('returns the latest version of the service if the version matches the latest version', async () => {
      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service tat handles the inventory',
        markdown: '# Hello world',
      });

      const test = await getService('InventoryService', '0.0.1');

      expect(test).toEqual({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service tat handles the inventory',
        markdown: '# Hello world',
      });
    });

    it('throws an error if the service is not found', async () => {
      await expect(getService('PaymentService')).rejects.toThrowError('No service found for the given id: PaymentService');
    });

    it('throws an error if the service is found but not the version', async () => {
      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service tat handles the inventory',
        markdown: '# Hello world',
      });

      await expect(getService('InventoryService', '1.0.0')).rejects.toThrowError(
        'No service found for the given id: InventoryService and version 1.0.0'
      );
    });
  });

  describe('writeService', () => {
    it('writes the given service to EventCatalog and assumes the path if one if not given', async () => {
      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service tat handles the inventory',
        markdown: '# Hello world',
      });

      const service = await getService('InventoryService');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService', 'index.md'))).toBe(true);

      expect(service).toEqual({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service tat handles the inventory',
        markdown: '# Hello world',
      });
    });

    it('writes the given service to EventCatalog under the correct path when a path is given', async () => {
      await writeService(
        {
          id: 'InventoryService',
          name: 'Inventory Service',
          version: '0.0.1',
          summary: 'Service tat handles the inventory',
          markdown: '# Hello world',
        },
        { path: '/Inventory/InventoryService' }
      );

      expect(fs.existsSync(path.join(CATALOG_PATH, 'services/Inventory/InventoryService', 'index.md'))).toBe(true);
    });

    it('throws an error when trying to write an service that already exists', async () => {
      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service tat handles the inventory',
        markdown: '# Hello world',
      });

      await expect(
        writeService({
          id: 'InventoryService',
          name: 'Inventory Service',
          version: '0.0.1',
          summary: 'Service tat handles the inventory',
          markdown: '# Hello world',
        })
      ).rejects.toThrowError('Failed to write service as the version 0.0.1 already exists');
    });
  });

  describe('versionService', () => {
    it('adds the given service to the versioned directory and removes itself from the root', async () => {
      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service tat handles the inventory',
        markdown: '# Hello world',
      });

      await versionService('InventoryService');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService/versioned/0.0.1', 'index.md'))).toBe(true);
      expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService', 'index.md'))).toBe(false);
    });
    it('adds the given service to the versioned directory and all files that are associated to it', async () => {
      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service tat handles the inventory',
        markdown: '# Hello world',
      });

      // Add random file in there
      await fs.writeFileSync(path.join(CATALOG_PATH, 'services/InventoryService', 'schema.json'), 'SCHEMA!');

      await versionService('InventoryService');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService/versioned/0.0.1', 'index.md'))).toBe(true);
      expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService/versioned/0.0.1', 'schema.json'))).toBe(true);
      expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService', 'index.md'))).toBe(false);
      expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService', 'schema.json'))).toBe(false);
    });
  });

  describe('rmService', () => {
    it('removes a service from eventcatalog by the given path', async () => {
      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service tat handles the inventory',
        markdown: '# Hello world',
      });

      expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService', 'index.md'))).toBe(true);

      await rmService('/InventoryService');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService', 'index.md'))).toBe(false);
    });
  });

  describe('rmServiceById', () => {
    it('removes a service from eventcatalog by id', async () => {
      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service tat handles the inventory',
        markdown: '# Hello world',
      });

      expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService', 'index.md'))).toBe(true);

      await rmServiceById('InventoryService');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService', 'index.md'))).toBe(false);
    });

    it('removes a service from eventcatalog by id and version', async () => {
      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service tat handles the inventory',
        markdown: '# Hello world',
      });

      expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService', 'index.md'))).toBe(true);

      await rmServiceById('InventoryService', '0.0.1');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService', 'index.md'))).toBe(false);
    });

    it('if version is given, only removes that version and not any other versions of the service', async () => {
      // write the first events
      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service tat handles the inventory',
        markdown: '# Hello world',
      });

      await versionService('InventoryService');

      // Write the versioned event
      await writeService({
        id: 'InventoryService',
        name: 'Inventory Adjusted',
        version: '0.0.2',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService', 'index.md'))).toBe(true);
      expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService/versioned/0.0.1', 'index.md'))).toBe(true);

      await rmServiceById('InventoryService', '0.0.1');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService', 'index.md'))).toBe(true);

      expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryAdjusted/versioned/0.0.2', 'index.md'))).toBe(false);
    });
  });

  describe('addFileToService', () => {
    it('takes a given file and writes it to the location of the given service', async () => {
      const file = { content: 'hello', fileName: 'test.txt' };

      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service tat handles the inventory',
        markdown: '# Hello world',
      });

      await addFileToService('InventoryService', file);

      expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService', 'test.txt'))).toBe(true);
    });

    it('takes a given file and version and writes the file to the correct location', async () => {
      const file = { content: 'hello', fileName: 'test.txt' };

      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service tat handles the inventory',
        markdown: '# Hello world',
      });

      await versionService('InventoryService');

      await addFileToService('InventoryService', file, '0.0.1');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService/versioned/0.0.1', 'test.txt'))).toBe(true);
    });

    it('throws an error when trying to write to a service that does not exist', () => {
      const file = { content: 'hello', fileName: 'test.txt' };

      expect(addFileToService('InventoryService', file)).rejects.toThrowError('Cannot find directory to write file to');
    });
  });
});
