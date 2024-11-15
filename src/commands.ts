import fs from 'node:fs/promises';
import { join } from 'node:path';
import type { Command } from './types';
import { addFileToResource, getResource, rmResourceById, versionResource, writeResource } from './internal/resources';
import { findFileById } from './internal/utils';
import { addMessageToService } from './services';

/**
 * Returns a command from EventCatalog.
 *
 * You can optionally specify a version to get a specific version of the command
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { getCommand } = utils('/path/to/eventcatalog');
 *
 * // Gets the latest version of the command
 * const command = await getCommand('UpdateInventory');
 *
 * // Gets a version of the command
 * const command = await getCommand('UpdateInventory', '0.0.1');
 * ```
 */
export const getCommand =
  (directory: string) =>
  async (id: string, version?: string): Promise<Command> =>
    getResource(directory, id, version, { type: 'command' }) as Promise<Command>;

/**
 * Write a command to EventCatalog.
 *
 * You can optionally override the path of the command.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { writeCommand } = utils('/path/to/eventcatalog');
 *
 * // Write a command to the catalog
 * // Command would be written to commands/UpdateInventory
 * await writeCommand({
 *   id: 'UpdateInventory',
 *   name: 'Update Inventory',
 *   version: '0.0.1',
 *   summary: 'This is a summary',
 *   markdown: '# Hello world',
 * });
 *
 * // Write a command to the catalog but override the path
 * // Command would be written to commands/Inventory/UpdateInventory
 * await writeCommand({
 *    id: 'UpdateInventory',
 *    name: 'Update Inventory',
 *    version: '0.0.1',
 *    summary: 'This is a summary',
 *    markdown: '# Hello world',
 * }, { path: "/Inventory/UpdateInventory"});
 *
 * // Write a command to the catalog and override the existing content (if there is any)
 * await writeCommand({
 *    id: 'UpdateInventory',
 *    name: 'Update Inventory',
 *    version: '0.0.1',
 *    summary: 'This is a summary',
 *    markdown: '# Hello world',
 * }, { override: true });
 * ```
 */
export const writeCommand =
  (directory: string) =>
  async (command: Command, options: { path?: string; override?: boolean } = { path: '' }) =>
    writeResource(directory, { ...command }, { ...options, type: 'command' });

/**
 * Write an command to a service in EventCatalog.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { writeCommandToService } = utils('/path/to/eventcatalog');
 *
 * // Write an event to a given service in the catalog
 * // Event would be written to services/Inventory/commands/UpdateInventory
 * await writeCommandToService({
 *    id: 'UpdateInventory',
 *    name: 'Update Inventory',
 *    version: '0.0.1',
 *    summary: 'This is a summary',
 *    markdown: '# Hello world',
 * }, { id: 'Inventory' });
 * ```
 */
export const writeCommandToService =
  (directory: string) =>
  async (command: Command, service: { id: string; version?: string }, options: { path: string } = { path: '' }) => {
    let pathForEvent =
      service.version && service.version !== 'latest'
        ? `/${service.id}/versioned/${service.version}/commands`
        : `/${service.id}/commands`;
    pathForEvent = join(pathForEvent, command.id);

    await writeResource(directory, { ...command }, { ...options, path: pathForEvent, type: 'command' });
  };

/**
 * Delete a command at it's given path.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { rmCommand } = utils('/path/to/eventcatalog');
 *
 * // removes a command at the given path (commands dir is appended to the given path)
 * // Removes the command at commands/UpdateInventory
 * await rmCommand('/UpdateInventory');
 * ```
 */
export const rmCommand = (directory: string) => async (path: string) => {
  await fs.rm(join(directory, path), { recursive: true });
};

/**
 * Delete a command by it's id.
 *
 * Optionally specify a version to delete a specific version of the command.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { rmCommandById } = utils('/path/to/eventcatalog');
 *
 * // deletes the latest UpdateInventory command
 * await rmCommandById('UpdateInventory');
 *
 * // deletes a specific version of the UpdateInventory command
 * await rmCommandById('UpdateInventory', '0.0.1');
 * ```
 */
export const rmCommandById = (directory: string) => async (id: string, version?: string) =>
  rmResourceById(directory, id, version, { type: 'command' });

/**
 * Version a command by it's id.
 *
 * Takes the latest command and moves it to a versioned directory.
 * All files with this command are also versioned (e.g /commands/UpdateInventory/schema.json)
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { versionCommand } = utils('/path/to/eventcatalog');
 *
 * // moves the latest UpdateInventory command to a versioned directory
 * // the version within that command is used as the version number.
 * await versionCommand('UpdateInventory');
 *
 * ```
 */
export const versionCommand = (directory: string) => async (id: string) => versionResource(directory, id);

/**
 * Add a file to a command by it's id.
 *
 * Optionally specify a version to add a file to a specific version of the command.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { addFileToCommand } = utils('/path/to/eventcatalog');
 *
 * // adds a file to the latest UpdateInventory command
 * await addFileToCommand('UpdateInventory', { content: 'Hello world', fileName: 'hello.txt' });
 *
 * // adds a file to a specific version of the UpdateInventory command
 * await addFileToCommand('UpdateInventory', { content: 'Hello world', fileName: 'hello.txt' }, '0.0.1');
 *
 * ```
 */
export const addFileToCommand =
  (directory: string) => async (id: string, file: { content: string; fileName: string }, version?: string) =>
    addFileToResource(directory, id, file, version);

/**
 * Add a schema to a command by it's id.
 *
 * Optionally specify a version to add a schema to a specific version of the command.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { addSchemaToCommand } = utils('/path/to/eventcatalog');
 *
 * // JSON schema example
 * const schema = {
 *    "$schema": "http://json-schema.org/draft-07/schema#",
 *    "type": "object",
 *    "properties": {
 *        "name": {
 *        "type": "string"
 *    },
 *    "age": {
 *      "type": "number"
 *    }
 *  },
 *  "required": ["name", "age"]
 * };
 *
 * // adds a schema to the latest UpdateInventory command
 * await addSchemaToCommand('UpdateInventory', { schema, fileName: 'schema.json' });
 *
 * // adds a file to a specific version of the UpdateInventory command
 * await addSchemaToCommand('UpdateInventory', { schema, fileName: 'schema.json' }, '0.0.1');
 *
 * ```
 */
export const addSchemaToCommand =
  (directory: string) => async (id: string, schema: { schema: string; fileName: string }, version?: string) => {
    await addFileToCommand(directory)(id, { content: schema.schema, fileName: schema.fileName }, version);
  };

/**
 * Check to see if the catalog has a version for the given command.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { commandHasVersion } = utils('/path/to/eventcatalog');
 *
 * // returns true if version is found for the given event and version (supports semver)
 * await commandHasVersion('InventoryAdjusted', '0.0.1');
 * await commandHasVersion('InventoryAdjusted', 'latest');
 * await commandHasVersion('InventoryAdjusted', '0.0.x');*
 *
 * ```
 */
export const commandHasVersion = (directory: string) => async (id: string, version: string) => {
  const file = await findFileById(directory, id, version);
  return !!file;
};
