// sum.test.js
import { expect, it, describe, beforeEach, afterEach } from 'vitest';
import utils from '../index';
import path from 'node:path';
import fs from 'node:fs';

const CATALOG_PATH = path.join(__dirname, 'catalog-events');

const { writeEvent, getEvent, rmEvent, rmEventById, versionEvent, addFileToEvent, addSchemaToEvent } = utils(CATALOG_PATH);

// clean the catalog before each test
beforeEach(() => {
  fs.rmSync(CATALOG_PATH, { recursive: true, force: true });
  fs.mkdirSync(CATALOG_PATH, { recursive: true });
});

afterEach(() => {
  fs.rmSync(CATALOG_PATH, { recursive: true, force: true });
});

describe('Events SDK', () => {
  describe('getEvent', () => {
    it('returns the given event id from EventCatalog and the latest version when no version is given,', async () => {
      await writeEvent({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      const test = await getEvent('InventoryAdjusted');

      expect(test).toEqual({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });
    });

    it('returns the given event id from EventCatalog and the requested version when a version is given,', async () => {
      await writeEvent({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      await versionEvent('InventoryAdjusted');

      await writeEvent({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '1.0.0',
        summary: 'This is version 1.0.0',
        markdown: '# Hello world',
      });

      const test = await getEvent('InventoryAdjusted', '0.0.1');

      expect(test).toEqual({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });
    });

    it('returns the latest version of the event if the version matches the latest version', async () => {
      await writeEvent({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      const test = await getEvent('InventoryAdjusted', '0.0.1');

      expect(test).toEqual({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });
    });

    it('throws an error if the event is not found', async () => {
      await expect(getEvent('InventoryAdjusted')).rejects.toThrowError('No event found for the given id: InventoryAdjusted');
    });

    it('throws an error if the event is  found but not the version', async () => {
      await writeEvent({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      await expect(getEvent('InventoryAdjusted', '1.0.0')).rejects.toThrowError(
        'No event found for the given id: InventoryAdjusted and version 1.0.0'
      );
    });
  });

  describe('writeEvent', () => {
    it('writes the given event to EventCatalog and assumes the path if one if not given', async () => {
      await writeEvent({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      const event = await getEvent('InventoryAdjusted');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'events/InventoryAdjusted', 'index.md'))).toBe(true);

      expect(event).toEqual({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });
    });

    it('writes the given event to EventCatalog under the correct path when a path is given', async () => {
      await writeEvent(
        {
          id: 'InventoryAdjusted',
          name: 'Inventory Adjusted',
          version: '0.0.1',
          summary: 'This is a summary',
          markdown: '# Hello world',
        },
        { path: '/Inventory/InventoryAdjusted' }
      );

      expect(fs.existsSync(path.join(CATALOG_PATH, 'events/Inventory/InventoryAdjusted', 'index.md'))).toBe(true);
    });

    it('throws an error when trying to write an event that already exists', async () => {
      const createEvent = async () =>
        writeEvent({
          id: 'InventoryAdjusted',
          name: 'Inventory Adjusted',
          version: '0.0.1',
          summary: 'This is a summary',
          markdown: '# Hello world',
        });

      await createEvent();

      await expect(
        writeEvent({
          id: 'InventoryAdjusted',
          name: 'Inventory Adjusted',
          version: '0.0.1',
          summary: 'This is a summary',
          markdown: '# Hello world',
        })
      ).rejects.toThrowError('Failed to write event as the version 0.0.1 already exists');
    });
  });

  describe('rmEvent', () => {
    it('removes an event from eventcatalog', async () => {
      await writeEvent({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      expect(fs.existsSync(path.join(CATALOG_PATH, 'events/InventoryAdjusted', 'index.md'))).toBe(true);

      await rmEvent('/InventoryAdjusted');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'events/InventoryAdjusted', 'index.md'))).toBe(false);
    });
  });

  describe('rmEventById', () => {
    it('removes an event from eventcatalog by id', async () => {
      await writeEvent({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      expect(fs.existsSync(path.join(CATALOG_PATH, 'events/InventoryAdjusted', 'index.md'))).toBe(true);

      await rmEventById('InventoryAdjusted');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'events/InventoryAdjusted', 'index.md'))).toBe(false);
    });

    it('removes an event from eventcatalog by id and version', async () => {
      await writeEvent({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      expect(fs.existsSync(path.join(CATALOG_PATH, 'events/InventoryAdjusted', 'index.md'))).toBe(true);

      await rmEventById('InventoryAdjusted', '0.0.1');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'events/InventoryAdjusted', 'index.md'))).toBe(false);
    });

    it('if version is given, only removes that version and not any other versions of the event', async () => {
      // write the first events
      await writeEvent({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      await versionEvent('InventoryAdjusted');

      // Write the versioned event
      await writeEvent({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.2',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      expect(fs.existsSync(path.join(CATALOG_PATH, 'events/InventoryAdjusted', 'index.md'))).toBe(true);
      expect(fs.existsSync(path.join(CATALOG_PATH, 'events/InventoryAdjusted/versioned/0.0.1', 'index.md'))).toBe(true);

      await rmEventById('InventoryAdjusted', '0.0.1');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'events/InventoryAdjusted', 'index.md'))).toBe(true);

      expect(fs.existsSync(path.join(CATALOG_PATH, 'events/InventoryAdjusted/versioned/0.0.2', 'index.md'))).toBe(false);
    });
  });

  describe('versionEvent', () => {
    it('adds the given event to the versioned directory and removes itself from the root', async () => {
      await writeEvent({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.2',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      // // Add random file in there
      // await fs.writeFileSync(path.join(CATALOG_PATH, 'events/Inventory/InventoryAdjusted', 'schema.json'), 'SCHEMA!');

      await versionEvent('InventoryAdjusted');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'events/InventoryAdjusted/versioned/0.0.2', 'index.md'))).toBe(true);

      expect(fs.existsSync(path.join(CATALOG_PATH, 'events/InventoryAdjusted', 'index.md'))).toBe(false);
    });
    it('adds the given event to the versioned directory and all files that are associated to it', async () => {
      await writeEvent({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.2',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      // Add random file in there
      await fs.writeFileSync(path.join(CATALOG_PATH, 'events/InventoryAdjusted', 'schema.json'), 'SCHEMA!');

      await versionEvent('InventoryAdjusted');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'events/InventoryAdjusted/versioned/0.0.2', 'index.md'))).toBe(true);

      expect(fs.existsSync(path.join(CATALOG_PATH, 'events/InventoryAdjusted/versioned/0.0.2', 'schema.json'))).toBe(true);

      expect(fs.existsSync(path.join(CATALOG_PATH, 'events/InventoryAdjusted', 'index.md'))).toBe(false);

      expect(fs.existsSync(path.join(CATALOG_PATH, 'events/InventoryAdjusted', 'schema.json'))).toBe(false);
    });
  });

  describe('addFileToEvent', () => {
    it('takes a given file and writes it to the location of the given event', async () => {
      const file = { content: 'hello', fileName: 'test.txt' };

      await writeEvent({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      await addFileToEvent('InventoryAdjusted', file);

      expect(fs.existsSync(path.join(CATALOG_PATH, 'events/InventoryAdjusted', 'test.txt'))).toBe(true);
    });

    it('takes a given file and version and writes the file to the correct location', async () => {
      const file = { content: 'hello', fileName: 'test.txt' };

      await writeEvent({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      // version the event
      await versionEvent('InventoryAdjusted');

      await addFileToEvent('InventoryAdjusted', file, '0.0.1');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'events/InventoryAdjusted/versioned/0.0.1', 'test.txt'))).toBe(true);
    });

    it('throws an error when trying to write to a event that does not exist', () => {
      const file = { content: 'hello', fileName: 'test.txt' };

      expect(addFileToEvent('InventoryAdjusted', file)).rejects.toThrowError('Cannot find directory to write file to');
    });
  });

  describe('addSchemaToEvent', () => {
    it('takes a given file and writes it to the location of the given event', async () => {
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

      await writeEvent({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      await addSchemaToEvent('InventoryAdjusted', file);

      expect(fs.existsSync(path.join(CATALOG_PATH, 'events/InventoryAdjusted', 'schema.json'))).toBe(true);
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

      await writeEvent({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      // version the event
      await versionEvent('InventoryAdjusted');

      await addSchemaToEvent('InventoryAdjusted', file, '0.0.1');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'events/InventoryAdjusted/versioned/0.0.1', 'schema.json'))).toBe(true);
    });

    it('throws an error when trying to write to a event that does not exist', () => {
      const file = { schema: 'hello', fileName: 'test.txt' };

      expect(addSchemaToEvent('InventoryAdjusted', file)).rejects.toThrowError('Cannot find directory to write file to');
    });
  });
});
