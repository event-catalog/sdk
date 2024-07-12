// sum.test.js
import { expect, it, describe, beforeEach, afterEach } from 'vitest';
import utils from '../index';
import path from 'node:path';
import fs from 'node:fs';

const CATALOG_PATH = path.join(__dirname, 'catalog');

const { writeEvent, rmEvent, rmEventById, versionEvent } = utils(CATALOG_PATH);

// clean the catalog before each test
beforeEach(() => {
  fs.rmSync(CATALOG_PATH, { recursive: true, force: true });
  fs.mkdirSync(CATALOG_PATH, { recursive: true });
});

afterEach(() => {
  // fs.rmSync(CATALOG_PATH, { recursive: true, force: true });
});

describe('Events SDK', () => {
  describe('writeEvent', () => {
    it('adds an event to eventcatalog', async () => {
      await writeEvent('/Inventory/InventoryAdjusted', {
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      const file = fs.readFileSync(
        path.join(CATALOG_PATH, 'events/Inventory/InventoryAdjusted', 'index.md'),
        'utf-8'
      );

      expect(
        fs.existsSync(path.join(CATALOG_PATH, 'events/Inventory/InventoryAdjusted', 'index.md'))
      ).toBe(true);

      expect(file).toMatchMarkdown(`---
        id: InventoryAdjusted
        name: Inventory Adjusted
        version: 0.0.1
        summary: This is a summary
        ---
        # Hello world
      `);
    });
  });

  describe('rmEvent', () => {
    it('removes an event from eventcatalog', async () => {
      await writeEvent('/Inventory/InventoryAdjusted', {
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      expect(
        fs.existsSync(path.join(CATALOG_PATH, 'events/Inventory/InventoryAdjusted', 'index.md'))
      ).toBe(true);

      await rmEvent('/Inventory/InventoryAdjusted');

      expect(
        fs.existsSync(path.join(CATALOG_PATH, 'events/Inventory/InventoryAdjusted', 'index.md'))
      ).toBe(false);
    });
  });

  describe('rmEventById', () => {
    it('removes an event from eventcatalog by id', async () => {
      await writeEvent('/Inventory/InventoryAdjusted', {
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      expect(
        fs.existsSync(path.join(CATALOG_PATH, 'events/Inventory/InventoryAdjusted', 'index.md'))
      ).toBe(true);

      await rmEventById('InventoryAdjusted');

      expect(
        fs.existsSync(path.join(CATALOG_PATH, 'events/Inventory/InventoryAdjusted', 'index.md'))
      ).toBe(false);
    });

    it('removes an event from eventcatalog by id and version', async () => {
      await writeEvent('/Inventory/InventoryAdjusted', {
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      expect(
        fs.existsSync(path.join(CATALOG_PATH, 'events/Inventory/InventoryAdjusted', 'index.md'))
      ).toBe(true);

      await rmEventById('InventoryAdjusted', '0.0.1');

      expect(
        fs.existsSync(path.join(CATALOG_PATH, 'events/Inventory/InventoryAdjusted', 'index.md'))
      ).toBe(false);
    });

    it('if version is given, only removes that version and not any other versions of the event', async () => {
      // write the first events
      await writeEvent('/Inventory/InventoryAdjusted', {
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.2',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      // Write the versioned event
      await writeEvent('/Inventory/InventoryAdjusted/versioned/0.0.2', {
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      expect(
        fs.existsSync(path.join(CATALOG_PATH, 'events/Inventory/InventoryAdjusted', 'index.md'))
      ).toBe(true);
      expect(
        fs.existsSync(
          path.join(CATALOG_PATH, 'events/Inventory/InventoryAdjusted/versioned/0.0.2', 'index.md')
        )
      ).toBe(true);

      await rmEventById('InventoryAdjusted', '0.0.2');

      expect(
        fs.existsSync(path.join(CATALOG_PATH, 'events/Inventory/InventoryAdjusted', 'index.md'))
      ).toBe(false);

      expect(
        fs.existsSync(
          path.join(CATALOG_PATH, 'events/Inventory/InventoryAdjusted/versioned/0.0.2', 'index.md')
        )
      ).toBe(true);
    });
  });

  //Version latest event
  describe('versionEvent', () => {
    it.only('adds the given event to the versioned directory and removes itself from the root', async () => {
      await writeEvent('/Inventory/InventoryAdjusted', {
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.2',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      // // Add random file in there
      // await fs.writeFileSync(path.join(CATALOG_PATH, 'events/Inventory/InventoryAdjusted', 'schema.json'), 'SCHEMA!');

      await versionEvent('InventoryAdjusted');

      expect(
        fs.existsSync(
          path.join(CATALOG_PATH, 'events/Inventory/InventoryAdjusted/versioned/0.0.2', 'index.md')
        )
      ).toBe(true);

      expect(
        fs.existsSync(path.join(CATALOG_PATH, 'events/Inventory/InventoryAdjusted', 'index.md'))
      ).toBe(false);
    });
    it.only('adds the given event to the versioned directory and all files that are associated to it', async () => {
      await writeEvent('/Inventory/InventoryAdjusted', {
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.2',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      // Add random file in there
      await fs.writeFileSync(
        path.join(CATALOG_PATH, 'events/Inventory/InventoryAdjusted', 'schema.json'),
        'SCHEMA!'
      );

      await versionEvent('InventoryAdjusted');

      expect(
        fs.existsSync(
          path.join(CATALOG_PATH, 'events/Inventory/InventoryAdjusted/versioned/0.0.2', 'index.md')
        )
      ).toBe(true);

      expect(
        fs.existsSync(
          path.join(
            CATALOG_PATH,
            'events/Inventory/InventoryAdjusted/versioned/0.0.2',
            'schema.json'
          )
        )
      ).toBe(true);

      expect(
        fs.existsSync(
          path.join(CATALOG_PATH, 'events/Inventory/InventoryAdjusted', 'index.md')
        )
      ).toBe(false);

      expect(
        fs.existsSync(
          path.join(
            CATALOG_PATH,
            'events/Inventory/InventoryAdjusted',
            'schema.json'
          )
        )
      ).toBe(false);
    });
  });
});
