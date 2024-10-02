// sum.test.js
import { expect, it, describe, beforeEach, afterEach } from 'vitest';
import utils from '../index';
import path from 'node:path';
import fs from 'node:fs';
import { Specifications } from '../types';

const CATALOG_PATH = path.join(__dirname, 'catalog-services');

const {
  writeService,
  getService,
  versionService,
  rmService,
  rmServiceById,
  addFileToService,
  addEventToService,
  addCommandToService,
  serviceHasVersion,
  getSpecificationFilesForService,
} = utils(CATALOG_PATH);

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

    it('returns the latest version of the service when `latest` is passed as the version', async () => {
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

      const test = await getService('InventoryService', 'latest');

      expect(test).toEqual({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '1.0.0',
        summary: 'Service tat handles the inventory',
        markdown: '# Hello world',
      });
    });

    it('returns undefined when a service cannot be found', async () => {
      await expect(await getService('PaymentService')).toEqual(undefined);
    });

    it('returns undefined if the service is found but not the version', async () => {
      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service that handles the inventory',
        markdown: '# Hello world',
      });

      await expect(await getService('InventoryService', '1.0.0')).toEqual(undefined);
    });

    it('returns the specifications for the service if the service has specifications', async () => {
      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service that handles the inventory',
        specifications: {
          asyncapiPath: 'spec.yaml',
        } satisfies Specifications,
        markdown: '# Hello world',
      });

      const test = await getService('InventoryService', 'latest');

      expect(test).toEqual({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service that handles the inventory',
        markdown: '# Hello world',
        specifications: { asyncapiPath: 'spec.yaml' },
      });
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

    it('messages written to a service are always unique', async () => {

      await writeService(
        {
          id: 'InventoryService',
          name: 'Inventory Service',
          version: '0.0.1',
          summary: 'Service tat handles the inventory',
          markdown: '# Hello world',
          sends: [
            { id: 'InventoryUpdatedEvent', version: '2.0.0' },
            { id: 'InventoryUpdatedEvent', version: '2.0.0' },
            { id: 'InventoryRemoved', version: '1.0.0' },
            { id: 'InventoryRemoved', version: '1.0.0' },
            { id: 'InventoryUpdated', version: '1.0.0' },
          ],
          receives: [
            { id: 'OrderComplete', version: '2.0.0' },
            { id: 'OrderComplete', version: '2.0.0' },
          ],
        },
        { path: '/Inventory/InventoryService' }
      );

      const service = await getService('InventoryService');

      expect(service.sends).toHaveLength(3);
      expect(service.receives).toHaveLength(1);

      expect(service.sends).toEqual([
        {
          "id": "InventoryUpdatedEvent",
          "version": "2.0.0"
        },
        {
          "id": "InventoryRemoved",
          "version": "1.0.0"
        },
        {
          "id": "InventoryUpdated",
          "version": "1.0.0"
        }
      ]);

      expect(service.receives).toEqual([
        {
          "id": "OrderComplete",
          "version": "2.0.0"
        }
      ]);

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

    it('taskes a given file for the serivce with id using yaml block string ">-" and writes the file to correct location', async () => {
      const file = { content: 'hello', fileName: 'test.txt' };

      await writeService({
        id: 'AVeryLargeIdWhichForcesWriteServiceToAddABlockCharacterxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service tat handles the inventory',
        markdown: '# Hello world',
      });

      await addFileToService(
        'AVeryLargeIdWhichForcesWriteServiceToAddABlockCharacterxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        file,
        '0.0.1'
      );

      expect(
        fs.existsSync(
          path.join(
            CATALOG_PATH,
            'services/AVeryLargeIdWhichForcesWriteServiceToAddABlockCharacterxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            'test.txt'
          )
        )
      ).toBe(true);
    });

    it('throws an error when trying to write to a service that does not exist', () => {
      const file = { content: 'hello', fileName: 'test.txt' };

      expect(addFileToService('InventoryService', file)).rejects.toThrowError('Cannot find directory to write file to');
    });
  });

  describe('addEventToService', () => {
    it('takes an existing event and adds it to the sends of an existing service', async () => {
      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service that handles the inventory',
        markdown: '# Hello world',
      });

      await addEventToService('InventoryService', 'sends', { id: 'InventoryUpdatedEvent', version: '2.0.0' }, '0.0.1');

      const service = await getService('InventoryService');

      expect(service).toEqual({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service that handles the inventory',
        sends: [
          {
            id: 'InventoryUpdatedEvent',
            version: '2.0.0',
          },
        ],
        markdown: '# Hello world',
      });
    });

    it('takes an existing event and adds it to the receives of an existing service', async () => {
      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service that handles the inventory',
        markdown: '# Hello world',
      });

      await addEventToService('InventoryService', 'receives', { id: 'InventoryUpdatedEvent', version: '2.0.0' }, '0.0.1');

      const service = await getService('InventoryService');

      expect(service).toEqual({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service that handles the inventory',
        receives: [
          {
            id: 'InventoryUpdatedEvent',
            version: '2.0.0',
          },
        ],
        markdown: '# Hello world',
      });
    });

    it('throws an error when trying to add an event to a service with an unsupported direction', async () => {
      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service that handles the inventory',
        markdown: '# Hello world',
      });

      expect(
        addEventToService('InventoryService', 'doesnotexist', { id: 'InventoryUpdatedEvent', version: '2.0.0' }, '0.0.1')
      ).rejects.toThrowError("Direction doesnotexist is invalid, only 'receives' and 'sends' are supported");
    });
  });
  describe('addCommandToService', () => {
    it('takes an existing command and adds it to the sends of an existing service', async () => {
      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service that handles the inventory',
        markdown: '# Hello world',
      });

      await addCommandToService('InventoryService', 'sends', { id: 'UpdateInventory', version: '2.0.0' }, '0.0.1');

      const service = await getService('InventoryService');

      expect(service).toEqual({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service that handles the inventory',
        sends: [
          {
            id: 'UpdateInventory',
            version: '2.0.0',
          },
        ],
        markdown: '# Hello world',
      });
    });

    it('takes an existing command and adds it to the receives of an existing service', async () => {
      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service that handles the inventory',
        markdown: '# Hello world',
      });

      await addCommandToService('InventoryService', 'receives', { id: 'UpdateInventory', version: '2.0.0' }, '0.0.1');

      const service = await getService('InventoryService');

      expect(service).toEqual({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service that handles the inventory',
        receives: [
          {
            id: 'UpdateInventory',
            version: '2.0.0',
          },
        ],
        markdown: '# Hello world',
      });
    });

    it('throws an error when trying to add an event to a service with an unsupported direction', async () => {
      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'Service that handles the inventory',
        markdown: '# Hello world',
      });

      expect(
        addCommandToService('InventoryService', 'doesnotexist', { id: 'InventoryUpdatedEvent', version: '2.0.0' }, '0.0.1')
      ).rejects.toThrowError("Direction doesnotexist is invalid, only 'receives' and 'sends' are supported");
    });
  });

  describe('serviceHasVersion', () => {
    it('returns true when a given service and version exists in the catalog', async () => {
      await writeService({
        id: 'AccountService',
        name: 'Accounts Service',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      expect(await serviceHasVersion('AccountService', '0.0.1')).toEqual(true);
    });

    it('returns true when a semver version is given and the version exists in the catalog', async () => {
      await writeService({
        id: 'AccountService',
        name: 'Accounts Service',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      expect(await serviceHasVersion('AccountService', '0.0.x')).toEqual(true);
    });

    it('returns true when a `latest` version is given and the version exists in the catalog', async () => {
      await writeService({
        id: 'AccountService',
        name: 'Accounts Service',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      expect(await serviceHasVersion('AccountService', 'latest')).toEqual(true);
    });

    it('returns false when event does not exist in the catalog', async () => {
      await writeService({
        id: 'AccountService',
        name: 'Accounts Service',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      expect(await serviceHasVersion('AccountService', '5.0.0')).toEqual(false);
    });
  });

  describe('getSpecificationFilesForService', () => {
    it('returns the specification files for a service', async () => {
      await writeService({
        id: 'AccountService',
        name: 'Accounts Service',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
        specifications: {
          asyncapiPath: 'spec.yaml',
        },
      });

      await addFileToService('AccountService', { content: 'fake-async-api-file', fileName: 'spec.yaml' }, '0.0.1');

      const specFiles = await getSpecificationFilesForService('AccountService', '0.0.1');

      expect(specFiles).toEqual([
        {
          content: 'fake-async-api-file',
          fileName: 'spec.yaml',
          path: expect.stringContaining('/services/AccountService/spec.yaml'),
          key: 'asyncapiPath',
        },
      ]);
    });

    it('returns the specification files for a versioned service', async () => {
      await writeService({
        id: 'AccountService',
        name: 'Accounts Service',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
        specifications: {
          asyncapiPath: 'spec.yaml',
        },
      });

      await addFileToService('AccountService', { content: 'fake-async-api-file', fileName: 'spec.yaml' }, '0.0.1');

      await versionService('AccountService');

      const specFiles = await getSpecificationFilesForService('AccountService', '0.0.1');

      expect(specFiles).toEqual([
        {
          content: 'fake-async-api-file',
          fileName: 'spec.yaml',
          path: expect.stringContaining('/services/AccountService/versioned/0.0.1/spec.yaml'),
          key: 'asyncapiPath',
        },
      ]);
    });

    it('throw an error if the specifications have been defined in the service but nothing can be found on disk', async () => {
      await writeService({
        id: 'AccountService',
        name: 'Accounts Service',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
        specifications: {
          asyncapiPath: 'spec.yaml',
        },
      });

      await expect(getSpecificationFilesForService('AccountService', '0.0.1')).rejects.toThrowError(
        'File spec.yaml does not exist in resource AccountService v(0.0.1)'
      );
    });
    it('returns an empty array of no specifications for a service have been defined', async () => {
      await writeService({
        id: 'AccountService',
        name: 'Accounts Service',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      const specFiles = await getSpecificationFilesForService('AccountService', '0.0.1');

      expect(specFiles).toEqual([]);
    });
  });
});
