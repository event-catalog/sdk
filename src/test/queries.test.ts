// sum.test.js
import { expect, it, describe, beforeEach, afterEach } from 'vitest';
import utils from '../index';
import path from 'node:path';
import fs from 'node:fs';

const CATALOG_PATH = path.join(__dirname, 'catalog-queries');

const {
  writeQuery,
  writeQueryToService,
  getQuery,
  rmQuery,
  rmQueryById,
  versionQuery,
  addFileToQuery,
  addSchemaToQuery,
  queryHasVersion,
  writeServiceToDomain,
} = utils(CATALOG_PATH);

// clean the catalog before each test
beforeEach(() => {
  fs.rmSync(CATALOG_PATH, { recursive: true, force: true });
  fs.mkdirSync(CATALOG_PATH, { recursive: true });
});

afterEach(() => {
  fs.rmSync(CATALOG_PATH, { recursive: true, force: true });
});

describe('Queries SDK', () => {
  describe('getQuery', () => {
    it('returns the given query id from EventCatalog and the latest version when no version is given,', async () => {
      await writeQuery({
        id: 'GetOrder',
        name: 'Get Order',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      const test = await getQuery('GetOrder');

      expect(test).toEqual({
        id: 'GetOrder',
        name: 'Get Order',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });
    });

    it('returns the given query id from EventCatalog and the latest version when no version is given and the query is inside a services folder,', async () => {
      await writeQuery(
        {
          id: 'GetOrder',
          name: 'Get Order',
          version: '0.0.1',
          summary: 'This is a summary',
          markdown: '# Hello world',
        },
        { path: '/services/InventoryService/GetOrder' }
      );

      const test = await getQuery('GetOrder');

      expect(test).toEqual({
        id: 'GetOrder',
        name: 'Get Order',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });
    });

    it('returns the given query id from EventCatalog and the requested version when a version is given,', async () => {
      await writeQuery({
        id: 'GetOrder',
        name: 'Get Order',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      await versionQuery('GetOrder');

      await writeQuery({
        id: 'GetOrder',
        name: 'Get Order',
        version: '1.0.0',
        summary: 'This is version 1.0.0',
        markdown: '# Hello world',
      });

      const test = await getQuery('GetOrder', '0.0.1');

      expect(test).toEqual({
        id: 'GetOrder',
        name: 'Get Order',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });
    });

    it('returns the latest version of the query if the version matches the latest version', async () => {
      await writeQuery({
        id: 'GetOrder',
        name: 'Get Order',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      const test = await getQuery('GetOrder', '0.0.1');

      expect(test).toEqual({
        id: 'GetOrder',
        name: 'Get Order',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });
    });

    it('returns the version of the query even if the query does not match semver matching', async () => {
      await writeQuery({
        id: 'GetOrder',
        name: 'Get Order',
        version: '100',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      const test = await getQuery('GetOrder', '100');

      expect(test).toEqual({
        id: 'GetOrder',
        name: 'Get Order',
        version: '100',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });
    });

    it('returns undefined when a given resource is not found', async () => {
      const query = await getQuery('GetOrder');
      await expect(query).toEqual(undefined);
    });

    it('throws an error if the query is found but not the version', async () => {
      await writeQuery({
        id: 'GetOrder',
        name: 'Get Order',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      await expect(await getQuery('GetOrder', '1.0.0')).toEqual(undefined);
    });

    describe('when queries are within a service that is within a domain', async () => {
      it('returns the given query id from EventCatalog and the latest version when no version is given,', async () => {
        await writeServiceToDomain(
          {
            id: 'InventoryService',
            name: 'Inventory Service',
            version: '0.0.1',
            summary: 'Service tat handles the inventory',
            markdown: '# Hello world',
          },
          { id: 'Shopping' }
        );

        await writeQueryToService(
          {
            id: 'GetOrder',
            name: 'Get Order',
            version: '0.0.1',
            summary: 'This is a summary',
            markdown: '# Hello world',
          },
          {
            id: 'InventoryService',
          }
        );

        const test = await getQuery('GetOrder');

        expect(test).toEqual({
          id: 'GetOrder',
          name: 'Get Order',
          version: '0.0.1',
          summary: 'This is a summary',
          markdown: '# Hello world',
        });
      });

      it('returns the given query id from EventCatalog and the latest version when no version is given and the query is inside a services folder,', async () => {
        await writeServiceToDomain(
          {
            id: 'InventoryService',
            name: 'Inventory Service',
            version: '0.0.1',
            summary: 'Service tat handles the inventory',
            markdown: '# Hello world',
          },
          { id: 'Shopping' }
        );

        await writeQueryToService(
          {
            id: 'GetOrder',
            name: 'Get Order',
            version: '0.0.1',
            summary: 'This is a summary',
            markdown: '# Hello world',
          },
          {
            id: 'InventoryService',
          }
        );

        const test = await getQuery('GetOrder');

        expect(test).toEqual({
          id: 'GetOrder',
          name: 'Get Order',
          version: '0.0.1',
          summary: 'This is a summary',
          markdown: '# Hello world',
        });
      });

      it('returns the given query id from EventCatalog and the requested version when a version is given,', async () => {
        await writeServiceToDomain(
          {
            id: 'InventoryService',
            name: 'Inventory Service',
            version: '0.0.1',
            summary: 'Service tat handles the inventory',
            markdown: '# Hello world',
          },
          { id: 'Shopping' }
        );

        await writeQueryToService(
          {
            id: 'GetOrder',
            name: 'Get Order',
            version: '0.0.1',
            summary: 'This is a summary',
            markdown: '# Hello world',
          },
          {
            id: 'InventoryService',
          }
        );

        await versionQuery('GetOrder');

        await writeQueryToService(
          {
            id: 'GetOrder',
            name: 'Get Order',
            version: '1.0.0',
            summary: 'This is a summary',
            markdown: '# Hello world',
          },
          {
            id: 'InventoryService',
          }
        );

        const test = await getQuery('GetOrder', '0.0.1');

        expect(test).toEqual({
          id: 'GetOrder',
          name: 'Get Order',
          version: '0.0.1',
          summary: 'This is a summary',
          markdown: '# Hello world',
        });
      });

      it('returns the latest version of the query if the version matches the latest version', async () => {
        await writeServiceToDomain(
          {
            id: 'InventoryService',
            name: 'Inventory Service',
            version: '0.0.1',
            summary: 'Service tat handles the inventory',
            markdown: '# Hello world',
          },
          { id: 'Shopping' }
        );

        await writeQueryToService(
          {
            id: 'GetOrder',
            name: 'Get Order',
            version: '0.0.1',
            summary: 'This is a summary',
            markdown: '# Hello world',
          },
          {
            id: 'InventoryService',
          }
        );

        const test = await getQuery('GetOrder', '0.0.1');

        expect(test).toEqual({
          id: 'GetOrder',
          name: 'Get Order',
          version: '0.0.1',
          summary: 'This is a summary',
          markdown: '# Hello world',
        });
      });

      it('returns the version of the query even if the query does not match semver matching', async () => {
        await writeServiceToDomain(
          {
            id: 'InventoryService',
            name: 'Inventory Service',
            version: '100',
            summary: 'Service tat handles the inventory',
            markdown: '# Hello world',
          },
          { id: 'Shopping' }
        );

        await writeQueryToService(
          {
            id: 'GetOrder',
            name: 'Get Order',
            version: '100',
            summary: 'This is a summary',
            markdown: '# Hello world',
          },
          {
            id: 'InventoryService',
          }
        );

        const test = await getQuery('GetOrder', '100');

        expect(test).toEqual({
          id: 'GetOrder',
          name: 'Get Order',
          version: '100',
          summary: 'This is a summary',
          markdown: '# Hello world',
        });
      });
    });
  });

  describe('writeQuery', () => {
    it('writes the given query to EventCatalog and assumes the path if one if not given', async () => {
      await writeQuery({
        id: 'GetOrder',
        name: 'Get Order',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      const query = await getQuery('GetOrder');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'queries/GetOrder', 'index.md'))).toBe(true);

      expect(query).toEqual({
        id: 'GetOrder',
        name: 'Get Order',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });
    });

    it('writes the given query to EventCatalog under the correct path when a path is given', async () => {
      await writeQuery(
        {
          id: 'GetOrder',
          name: 'Get Order',
          version: '0.0.1',
          summary: 'This is a summary',
          markdown: '# Hello world',
        },
        { path: '/Inventory/GetOrder' }
      );

      expect(fs.existsSync(path.join(CATALOG_PATH, 'queries/Inventory/GetOrder', 'index.md'))).toBe(true);
    });

    it('throws an error when trying to write an query that already exists', async () => {
      const createQuery = async () =>
        writeQuery({
          id: 'GetOrder',
          name: 'Get Order',
          version: '0.0.1',
          summary: 'This is a summary',
          markdown: '# Hello world',
        });

      await createQuery();

      await expect(
        writeQuery({
          id: 'GetOrder',
          name: 'Get Order',
          version: '0.0.1',
          summary: 'This is a summary',
          markdown: '# Hello world',
        })
      ).rejects.toThrowError('Failed to write GetOrder (query) as the version 0.0.1 already exists');
    });
  });

  describe('writeQueryToService', () => {
    it('writes an query to the given service. When no version if given for the service the query is added to the latest service', async () => {
      await writeQueryToService(
        {
          id: 'GetOrder',
          name: 'Get Order',
          version: '0.0.1',
          summary: 'This is a summary',
          markdown: '# Hello world',
        },
        {
          id: 'InventoryService',
        }
      );

      expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService/queries/GetOrder', 'index.md'))).toBe(true);
    });
    it('writes an query to the given service. When a version is given for the service the query is added to that service version', async () => {
      await writeQueryToService(
        {
          id: 'GetOrder',
          name: 'Get Order',
          version: '0.0.1',
          summary: 'This is a summary',
          markdown: '# Hello world',
        },
        {
          id: 'InventoryService',
          version: '1.0.0',
        }
      );
      expect(
        fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService/versioned/1.0.0/queries/GetOrder', 'index.md'))
      ).toBe(true);
    });
    it('writes an query to the given service. When a version is the latest the query is added to the latest version of the service', async () => {
      await writeQueryToService(
        {
          id: 'GetOrder',
          name: 'Get Order',
          version: '0.0.1',
          summary: 'This is a summary',
          markdown: '# Hello world',
        },
        {
          id: 'InventoryService',
          version: 'latest',
        }
      );
      expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService//queries/GetOrder', 'index.md'))).toBe(true);
    });
  });

  describe('rmQuery', () => {
    it('removes an query from eventcatalog', async () => {
      await writeQuery({
        id: 'GetOrder',
        name: 'Get Order',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      expect(fs.existsSync(path.join(CATALOG_PATH, 'queries/GetOrder', 'index.md'))).toBe(true);

      await rmQuery('/GetOrder');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'queries/GetOrder', 'index.md'))).toBe(false);
    });
  });

  describe('rmQueryById', () => {
    it('removes an query from eventcatalog by id', async () => {
      await writeQuery({
        id: 'GetOrder',
        name: 'Get Order',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      expect(fs.existsSync(path.join(CATALOG_PATH, 'queries/GetOrder', 'index.md'))).toBe(true);

      await rmQueryById('GetOrder');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'queries/GetOrder', 'index.md'))).toBe(false);
    });

    it('removes an query from eventcatalog by id and version', async () => {
      await writeQuery({
        id: 'GetOrder',
        name: 'Get Order',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      expect(fs.existsSync(path.join(CATALOG_PATH, 'queries/GetOrder', 'index.md'))).toBe(true);

      await rmQueryById('GetOrder', '0.0.1');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'queries/GetOrder', 'index.md'))).toBe(false);
    });

    it('if version is given, only removes that version and not any other versions of the query', async () => {
      // write the first queries
      await writeQuery({
        id: 'GetOrder',
        name: 'Get Order',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      await versionQuery('GetOrder');

      // Write the versioned query
      await writeQuery({
        id: 'GetOrder',
        name: 'Get Order',
        version: '0.0.2',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      expect(fs.existsSync(path.join(CATALOG_PATH, 'queries/GetOrder', 'index.md'))).toBe(true);
      expect(fs.existsSync(path.join(CATALOG_PATH, 'queries/GetOrder/versioned/0.0.1', 'index.md'))).toBe(true);

      await rmQueryById('GetOrder', '0.0.1');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'queries/GetOrder', 'index.md'))).toBe(true);

      expect(fs.existsSync(path.join(CATALOG_PATH, 'queries/GetOrder/versioned/0.0.2', 'index.md'))).toBe(false);
    });

    describe('when queries are within a service directory', () => {
      it('removes an query from EventCatalog by id', async () => {
        await writeQueryToService(
          {
            id: 'GetOrder',
            name: 'Get Order',
            version: '0.0.1',
            summary: 'This is a summary',
            markdown: '# Hello world',
          },
          {
            id: 'InventoryService',
          }
        );

        // expect(fs.existsSync(path.join(CATALOG_PATH, 'services/Inventory/queries/GetOrder', 'index.md'))).toBe(true);
        expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService/queries/GetOrder', 'index.md'))).toBe(true);
        await rmQueryById('GetOrder');
        expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService/queries/GetOrder', 'index.md'))).toBe(false);
      });

      it('if version is given, only removes that version and not any other versions of the query', async () => {
        // write the first queries
        await writeQueryToService(
          {
            id: 'GetOrder',
            name: 'Get Order',
            version: '0.0.1',
            summary: 'This is a summary',
            markdown: '# Hello world',
          },
          {
            id: 'InventoryService',
          }
        );

        await versionQuery('GetOrder');

        // Write the versioned query
        await writeQueryToService(
          {
            id: 'GetOrder',
            name: 'Get Order',
            version: '0.0.2',
            summary: 'This is a summary',
            markdown: '# Hello world',
          },
          {
            id: 'InventoryService',
          }
        );

        expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService/queries/GetOrder', 'index.md'))).toBe(true);
        expect(
          fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService/queries/GetOrder/versioned/0.0.1', 'index.md'))
        ).toBe(true);

        await rmQueryById('GetOrder', '0.0.1');

        expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService/queries/GetOrder', 'index.md'))).toBe(true);
        expect(
          fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService/queries/GetOrder/versioned/0.0.1', 'index.md'))
        ).toBe(false);
      });
    });
  });

  describe('versionQuery', () => {
    it('adds the given query to the versioned directory and removes itself from the root', async () => {
      await writeQuery({
        id: 'GetOrder',
        name: 'Get Order',
        version: '0.0.2',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      // // Add random file in there
      // await fs.writeFileSync(path.join(CATALOG_PATH, 'queries/Inventory/GetOrder', 'schema.json'), 'SCHEMA!');

      await versionQuery('GetOrder');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'queries/GetOrder/versioned/0.0.2', 'index.md'))).toBe(true);

      expect(fs.existsSync(path.join(CATALOG_PATH, 'queries/GetOrder', 'index.md'))).toBe(false);
    });
    it('adds the given query to the versioned directory and all files that are associated to it', async () => {
      await writeQuery({
        id: 'GetOrder',
        name: 'Get Order',
        version: '0.0.2',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      // Add random file in there
      await fs.writeFileSync(path.join(CATALOG_PATH, 'queries/GetOrder', 'schema.json'), 'SCHEMA!');

      await versionQuery('GetOrder');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'queries/GetOrder/versioned/0.0.2', 'index.md'))).toBe(true);

      expect(fs.existsSync(path.join(CATALOG_PATH, 'queries/GetOrder/versioned/0.0.2', 'schema.json'))).toBe(true);

      expect(fs.existsSync(path.join(CATALOG_PATH, 'queries/GetOrder', 'index.md'))).toBe(false);

      expect(fs.existsSync(path.join(CATALOG_PATH, 'queries/GetOrder', 'schema.json'))).toBe(false);
    });

    describe('when queries are within a service directory', () => {
      it('adds the given query to the versioned directory and removes itself from the root', async () => {
        await writeQueryToService(
          {
            id: 'GetOrder',
            name: 'Get Order',
            version: '0.0.2',
            summary: 'This is a summary',
            markdown: '# Hello world',
          },
          { id: 'InventoryService' }
        );

        await versionQuery('GetOrder');

        expect(
          fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService/queries/GetOrder/versioned/0.0.2', 'index.md'))
        ).toBe(true);
        expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService/queries/GetOrder', 'index.md'))).toBe(false);
      });
      it('adds the given query to the versioned directory and all files that are associated to it', async () => {
        await writeQueryToService(
          {
            id: 'GetOrder',
            name: 'Get Order',
            version: '0.0.2',
            summary: 'This is a summary',
            markdown: '# Hello world',
          },
          { id: 'InventoryService' }
        );

        // Add random file in there
        await fs.writeFileSync(path.join(CATALOG_PATH, 'services/InventoryService/queries/GetOrder', 'schema.json'), 'SCHEMA!');

        await versionQuery('GetOrder');

        expect(
          fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService/queries/GetOrder/versioned/0.0.2', 'index.md'))
        ).toBe(true);

        expect(
          fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService/queries/GetOrder/versioned/0.0.2', 'schema.json'))
        ).toBe(true);

        expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService/queries/GetOrder', 'index.md'))).toBe(false);

        expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService/queries/GetOrder', 'schema.json'))).toBe(false);
      });
    });
  });

  describe('addFileToQuery', () => {
    it('takes a given file and writes it to the location of the given query', async () => {
      const file = { content: 'hello', fileName: 'test.txt' };

      await writeQuery({
        id: 'GetOrder',
        name: 'Get Order',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      await addFileToQuery('GetOrder', file);

      expect(fs.existsSync(path.join(CATALOG_PATH, 'queries/GetOrder', 'test.txt'))).toBe(true);
    });

    it('takes a given file and version and writes the file to the correct location', async () => {
      const file = { content: 'hello', fileName: 'test.txt' };

      await writeQuery({
        id: 'GetOrder',
        name: 'Get Order',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      // version the query
      await versionQuery('GetOrder');

      await addFileToQuery('GetOrder', file, '0.0.1');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'queries/GetOrder/versioned/0.0.1', 'test.txt'))).toBe(true);
    });

    it('throws an error when trying to write to a query that does not exist', () => {
      const file = { content: 'hello', fileName: 'test.txt' };

      expect(addFileToQuery('GetOrder', file)).rejects.toThrowError('Cannot find directory to write file to');
    });

    describe('when queries are within a service directory', () => {
      it('takes a given file and writes it to the location of the given query', async () => {
        const file = { content: 'hello', fileName: 'test.txt' };

        await writeQueryToService(
          {
            id: 'GetOrder',
            name: 'Get Order',
            version: '0.0.1',
            summary: 'This is a summary',
            markdown: '# Hello world',
          },
          { id: 'InventoryService' }
        );

        await addFileToQuery('GetOrder', file);

        expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService/queries/GetOrder', 'test.txt'))).toBe(true);
      });

      it('takes a given file and version and writes the file to the correct location', async () => {
        const file = { content: 'hello', fileName: 'test.txt' };

        await writeQueryToService(
          {
            id: 'GetOrder',
            name: 'Get Order',
            version: '0.0.1',
            summary: 'This is a summary',
            markdown: '# Hello world',
          },
          { id: 'InventoryService' }
        );

        // version the query
        await versionQuery('GetOrder');

        await addFileToQuery('GetOrder', file, '0.0.1');

        expect(
          fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService/queries/GetOrder/versioned/0.0.1', 'test.txt'))
        ).toBe(true);
      });
    });
  });

  describe('addSchemaToQuery', () => {
    it('takes a given file and writes it to the location of the given query', async () => {
      const schema = `{
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "age": {
            "type": "number"
          }
        }
      }`;
      const file = { schema, fileName: 'schema.json' };

      await writeQuery({
        id: 'GetOrder',
        name: 'Get Order',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      await addSchemaToQuery('GetOrder', file);

      expect(fs.existsSync(path.join(CATALOG_PATH, 'queries/GetOrder', 'schema.json'))).toBe(true);
    });

    it('takes a given file and version and writes the file to the correct location', async () => {
      const schema = `{
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "age": {
            "type": "number"
          }
        }
      }`;
      const file = { schema, fileName: 'schema.json' };

      await writeQuery({
        id: 'GetOrder',
        name: 'Get Order',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      // version the query
      await versionQuery('GetOrder');

      await addSchemaToQuery('GetOrder', file, '0.0.1');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'queries/GetOrder/versioned/0.0.1', 'schema.json'))).toBe(true);
    });

    it('throws an error when trying to write to a query that does not exist', () => {
      const file = { schema: 'hello', fileName: 'test.txt' };

      expect(addSchemaToQuery('GetOrder', file)).rejects.toThrowError('Cannot find directory to write file to');
    });

    describe('when queries are within a service directory', () => {
      it('takes a given file and writes it to the location of the given query', async () => {
        const schema = `{
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "age": {
              "type": "number"
            }
          }
        }`;
        const file = { schema, fileName: 'schema.json' };

        await writeQueryToService(
          {
            id: 'GetOrder',
            name: 'Get Order',
            version: '0.0.1',
            summary: 'This is a summary',
            markdown: '# Hello world',
          },
          { id: 'InventoryService' }
        );

        await addSchemaToQuery('GetOrder', file);

        expect(fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService/queries/GetOrder', 'schema.json'))).toBe(true);
      });

      it('takes a given file and version and writes the file to the correct location', async () => {
        const schema = `{
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "age": {
              "type": "number"
            }
          }
        }`;
        const file = { schema, fileName: 'schema.json' };

        await writeQueryToService(
          {
            id: 'GetOrder',
            name: 'Get Order',
            version: '0.0.1',
            summary: 'This is a summary',
            markdown: '# Hello world',
          },
          { id: 'InventoryService' }
        );

        // version the query
        await versionQuery('GetOrder');

        await addSchemaToQuery('GetOrder', file, '0.0.1');

        expect(
          fs.existsSync(path.join(CATALOG_PATH, 'services/InventoryService/queries/GetOrder/versioned/0.0.1', 'schema.json'))
        ).toBe(true);
      });
    });
  });

  describe('queryHasVersion', () => {
    it('returns true when a given query and version exists in the catalog', async () => {
      await writeQuery({
        id: 'GetOrder',
        name: 'Get Order',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      expect(await queryHasVersion('GetOrder', '0.0.1')).toEqual(true);
    });

    it('returns true when a semver version is given and the version exists in the catalog', async () => {
      await writeQuery({
        id: 'GetOrder',
        name: 'Get Order',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      expect(await queryHasVersion('GetOrder', '0.0.x')).toEqual(true);
    });

    it('returns true when a `latest` version is given and the version exists in the catalog', async () => {
      await writeQuery({
        id: 'GetOrder',
        name: 'Get Order',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      expect(await queryHasVersion('GetOrder', 'latest')).toEqual(true);
    });

    it('returns false when query does not exist in the catalog', async () => {
      await writeQuery({
        id: 'GetOrder',
        name: 'Get Order',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      expect(await queryHasVersion('GetOrder', '5.0.0')).toEqual(false);
    });
  });
});
