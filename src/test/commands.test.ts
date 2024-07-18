// sum.test.js
import { expect, it, describe, beforeEach, afterEach } from 'vitest';
import utils from '../index';
import path from 'node:path';
import fs from 'node:fs';

const CATALOG_PATH = path.join(__dirname, 'catalog-commands');

const { writeCommand, getCommand, rmCommand, rmCommandById, versionCommand, addFileToCommand, addSchemaToCommand } =
  utils(CATALOG_PATH);

// clean the catalog before each test
beforeEach(() => {
  fs.rmSync(CATALOG_PATH, { recursive: true, force: true });
  fs.mkdirSync(CATALOG_PATH, { recursive: true });
});

afterEach(() => {
  fs.rmSync(CATALOG_PATH, { recursive: true, force: true });
});

describe('Commands SDK', () => {
  describe('getCommand', () => {
    it('returns the given command id from EventCatalog and the latest version when no version is given,', async () => {
      await writeCommand({
        id: 'UpdateInventory',
        name: 'Update Inventory',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      const test = await getCommand('UpdateInventory');

      expect(test).toEqual({
        id: 'UpdateInventory',
        name: 'Update Inventory',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });
    });

    it('returns the given command id from EventCatalog and the requested version when a version is given,', async () => {
      await writeCommand({
        id: 'UpdateInventory',
        name: 'Update Inventory',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      await versionCommand('UpdateInventory');

      await writeCommand({
        id: 'UpdateInventory',
        name: 'Update Inventory',
        version: '1.0.0',
        summary: 'This is version 1.0.0',
        markdown: '# Hello world',
      });

      const test = await getCommand('UpdateInventory', '0.0.1');

      expect(test).toEqual({
        id: 'UpdateInventory',
        name: 'Update Inventory',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });
    });

    it('throws an error if the command is not found', async () => {
      await expect(getCommand('UpdateInventory')).rejects.toThrowError('No command found for the given id: UpdateInventory');
    });

    it('throws an error if the command is  found but not the version', async () => {
      await writeCommand({
        id: 'UpdateInventory',
        name: 'Update Inventory',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      await expect(getCommand('UpdateInventory', '1.0.0')).rejects.toThrowError(
        'No command found for the given id: UpdateInventory and version 1.0.0'
      );
    });
  });

  describe('writeCommand', () => {
    it('writes the given command to EventCatalog and assumes the path if one if not given', async () => {
      await writeCommand({
        id: 'UpdateInventory',
        name: 'Update Inventory',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      const command = await getCommand('UpdateInventory');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'commands/UpdateInventory', 'index.md'))).toBe(true);

      expect(command).toEqual({
        id: 'UpdateInventory',
        name: 'Update Inventory',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });
    });

    it('writes the given command to EventCatalog under the correct path when a path is given', async () => {
      await writeCommand(
        {
          id: 'UpdateInventory',
          name: 'Update Inventory',
          version: '0.0.1',
          summary: 'This is a summary',
          markdown: '# Hello world',
        },
        { path: '/Inventory/UpdateInventory' }
      );

      expect(fs.existsSync(path.join(CATALOG_PATH, 'commands/Inventory/UpdateInventory', 'index.md'))).toBe(true);
    });

    it('throws an error when trying to write an command that already exists', async () => {
      const createEvent = async () =>
        writeCommand({
          id: 'UpdateInventory',
          name: 'Update Inventory',
          version: '0.0.1',
          summary: 'This is a summary',
          markdown: '# Hello world',
        });

      await createEvent();

      await expect(
        writeCommand({
          id: 'UpdateInventory',
          name: 'Update Inventory',
          version: '0.0.1',
          summary: 'This is a summary',
          markdown: '# Hello world',
        })
      ).rejects.toThrowError('Failed to write command as the version 0.0.1 already exists');
    });
  });

  describe('rmCommand', () => {
    it('removes a command from eventcatalog', async () => {
      await writeCommand({
        id: 'UpdateInventory',
        name: 'Update Inventory',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      expect(fs.existsSync(path.join(CATALOG_PATH, 'commands/UpdateInventory', 'index.md'))).toBe(true);

      await rmCommand('/UpdateInventory');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'commands/UpdateInventory', 'index.md'))).toBe(false);
    });
  });

  describe('rmCommandById', () => {
    it('removes an command from eventcatalog by id', async () => {
      await writeCommand({
        id: 'UpdateInventory',
        name: 'Update Inventory',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      expect(fs.existsSync(path.join(CATALOG_PATH, 'commands/UpdateInventory', 'index.md'))).toBe(true);

      await rmCommandById('UpdateInventory');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'commands/UpdateInventory', 'index.md'))).toBe(false);
    });

    it('removes an command from eventcatalog by id and version', async () => {
      await writeCommand({
        id: 'UpdateInventory',
        name: 'Update Inventory',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      expect(fs.existsSync(path.join(CATALOG_PATH, 'commands/UpdateInventory', 'index.md'))).toBe(true);

      await rmCommandById('UpdateInventory', '0.0.1');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'commands/UpdateInventory', 'index.md'))).toBe(false);
    });

    it('if version is given, only removes that version and not any other versions of the command', async () => {
      await writeCommand({
        id: 'UpdateInventory',
        name: 'Update Inventory',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      await versionCommand('UpdateInventory');

      // Write the versioned command
      await writeCommand({
        id: 'UpdateInventory',
        name: 'Update Inventory',
        version: '0.0.2',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      expect(fs.existsSync(path.join(CATALOG_PATH, 'commands/UpdateInventory', 'index.md'))).toBe(true);
      expect(fs.existsSync(path.join(CATALOG_PATH, 'commands/UpdateInventory/versioned/0.0.1', 'index.md'))).toBe(true);

      await rmCommandById('UpdateInventory', '0.0.1');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'commands/UpdateInventory', 'index.md'))).toBe(true);

      expect(fs.existsSync(path.join(CATALOG_PATH, 'commands/UpdateInventory/versioned/0.0.2', 'index.md'))).toBe(false);
    });
  });

  describe('versionCommand', () => {
    it('adds the given command to the versioned directory and removes itself from the root', async () => {
      await writeCommand({
        id: 'UpdateInventory',
        name: 'Update Inventory',
        version: '0.0.2',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      // // Add random file in there
      // await fs.writeFileSync(path.join(CATALOG_PATH, 'commands/Inventory/UpdateInventory', 'schema.json'), 'SCHEMA!');

      await versionCommand('UpdateInventory');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'commands/UpdateInventory/versioned/0.0.2', 'index.md'))).toBe(true);

      expect(fs.existsSync(path.join(CATALOG_PATH, 'commands/UpdateInventory', 'index.md'))).toBe(false);
    });
    it('adds the given command to the versioned directory and all files that are associated to it', async () => {
      await writeCommand({
        id: 'UpdateInventory',
        name: 'Update Inventory',
        version: '0.0.2',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      // Add random file in there
      await fs.writeFileSync(path.join(CATALOG_PATH, 'commands/UpdateInventory', 'schema.json'), 'SCHEMA!');

      await versionCommand('UpdateInventory');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'commands/UpdateInventory/versioned/0.0.2', 'index.md'))).toBe(true);

      expect(fs.existsSync(path.join(CATALOG_PATH, 'commands/UpdateInventory/versioned/0.0.2', 'schema.json'))).toBe(true);

      expect(fs.existsSync(path.join(CATALOG_PATH, 'commands/UpdateInventory', 'index.md'))).toBe(false);

      expect(fs.existsSync(path.join(CATALOG_PATH, 'commands/UpdateInventory', 'schema.json'))).toBe(false);
    });
  });

  describe('addFileToCommand', () => {
    it('takes a given file and writes it to the location of the given command', async () => {
      const file = { content: 'hello', fileName: 'test.txt' };

      await writeCommand({
        id: 'UpdateInventory',
        name: 'Update Inventory',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      await addFileToCommand('UpdateInventory', file);

      expect(fs.existsSync(path.join(CATALOG_PATH, 'commands/UpdateInventory', 'test.txt'))).toBe(true);
    });

    it('takes a given file and version and writes the file to the correct location', async () => {
      const file = { content: 'hello', fileName: 'test.txt' };

      await writeCommand({
        id: 'UpdateInventory',
        name: 'Update Inventory',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      // version the command
      await versionCommand('UpdateInventory');

      await addFileToCommand('UpdateInventory', file, '0.0.1');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'commands/UpdateInventory/versioned/0.0.1', 'test.txt'))).toBe(true);
    });

    it('throws an error when trying to write to a command that does not exist', () => {
      const file = { content: 'hello', fileName: 'test.txt' };

      expect(addFileToCommand('UpdateInventory', file)).rejects.toThrowError('Cannot find directory to write file to');
    });
  });

  describe('addSchemaToCommand', () => {
    it('takes a given file and writes it to the location of the given command', async () => {
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

      await writeCommand({
        id: 'UpdateInventory',
        name: 'Update Inventory',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      await addSchemaToCommand('UpdateInventory', file);

      expect(fs.existsSync(path.join(CATALOG_PATH, 'commands/UpdateInventory', 'schema.json'))).toBe(true);
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

      await writeCommand({
        id: 'UpdateInventory',
        name: 'Update Inventory',
        version: '0.0.1',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      // version the command
      await versionCommand('UpdateInventory');

      await addSchemaToCommand('UpdateInventory', file, '0.0.1');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'commands/UpdateInventory/versioned/0.0.1', 'schema.json'))).toBe(true);
    });

    it('throws an error when trying to write to a command that does not exist', () => {
      const file = { schema: 'hello', fileName: 'test.txt' };

      expect(addSchemaToCommand('UpdateInventory', file)).rejects.toThrowError('Cannot find directory to write file to');
    });
  });
});
