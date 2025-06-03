import { expect, it, describe, beforeEach, afterEach } from 'vitest';
import utils from '../index';
import path from 'node:path';
import fs from 'node:fs';

const CATALOG_PATH = path.join(__dirname, 'catalog-messages');

const {
  getMessageBySchemaPath,
  writeEvent,
  addSchemaToEvent,
  getProducersAndConsumersForMessage,
  writeService,
  addEventToService,
  versionEvent,
} = utils(CATALOG_PATH);

// clean the catalog before each test
beforeEach(() => {
  fs.rmSync(CATALOG_PATH, { recursive: true, force: true });
  fs.mkdirSync(CATALOG_PATH, { recursive: true });
});

afterEach(() => {
  fs.rmSync(CATALOG_PATH, { recursive: true, force: true });
});

describe('Messages SDK', () => {
  describe('getMessageBySchemaPath', () => {
    it('returns a message from the given schema path to the message,', async () => {
      await writeEvent({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      const schema = `{
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          }
        }
      }`;

      await addSchemaToEvent('InventoryAdjusted', { schema, fileName: 'schema.json' });

      const test = await getMessageBySchemaPath('events/InventoryAdjusted/schema.json');

      expect(test).toEqual({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });
    });
  });

  describe('getProducersAndConsumersForMessage', () => {
    it('returns the producers and consumers for a given message', async () => {
      await writeEvent({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      await writeService({
        id: 'OrderService',
        name: 'Order Service',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      await addEventToService('InventoryService', 'sends', { id: 'InventoryAdjusted', version: '0.0.1' }, '0.0.1');
      await addEventToService('OrderService', 'receives', { id: 'InventoryAdjusted', version: '0.0.1' }, '0.0.1');

      const { producers, consumers } = await getProducersAndConsumersForMessage('InventoryAdjusted', '0.0.1');

      expect(producers).toEqual([
        {
          id: 'InventoryService',
          name: 'Inventory Service',
          version: '0.0.1',
          summary: 'This is a summary',
          markdown: '# Hello world',
          sends: [
            {
              id: 'InventoryAdjusted',
              version: '0.0.1',
            },
          ],
        },
      ]);
      expect(consumers).toEqual([
        {
          id: 'OrderService',
          name: 'Order Service',
          version: '0.0.1',
          summary: 'This is a summary',
          markdown: '# Hello world',
          receives: [
            {
              id: 'InventoryAdjusted',
              version: '0.0.1',
            },
          ],
        },
      ]);
    });

    it('when the service sends a message, but the version is not specified and the message is the latest version, it should be added to the sends of the service', async () => {
      await writeEvent({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
        sends: [
          {
            id: 'InventoryAdjusted',
          },
        ],
      });

      const { producers } = await getProducersAndConsumersForMessage('InventoryAdjusted', '0.0.1');

      expect(producers).toEqual([
        {
          id: 'InventoryService',
          name: 'Inventory Service',
          version: '0.0.1',
          sends: [
            {
              id: 'InventoryAdjusted',
            },
          ],
          markdown: '# Hello world',
          summary: 'This is a summary',
        },
      ]);
    });

    it('when the service receives a message, but the version is not specified and the message is the latest version, it should be added to the receives of the service', async () => {
      await writeEvent({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
        receives: [
          {
            id: 'InventoryAdjusted',
          },
        ],
      });

      const { consumers } = await getProducersAndConsumersForMessage('InventoryAdjusted', '0.0.1');

      expect(consumers).toEqual([
        {
          id: 'InventoryService',
          name: 'Inventory Service',
          version: '0.0.1',
          receives: [
            {
              id: 'InventoryAdjusted',
            },
          ],
          markdown: '# Hello world',
          summary: 'This is a summary',
        },
      ]);
    });

    it('when the service sends a message, but the version is not specified and the message is not the latest version, it should not be added to the sends of the service', async () => {
      await writeEvent({
        id: 'InventoryAdjusted',
        name: 'Inventory Adjusted',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      await versionEvent('InventoryAdjusted');

      await writeService({
        id: 'InventoryService',
        name: 'Inventory Service',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
        sends: [
          {
            id: 'InventoryAdjusted',
          },
        ],
      });

      const { producers } = await getProducersAndConsumersForMessage('InventoryAdjusted', '0.0.1');

      expect(producers).toEqual([]);
    });
  });
});
