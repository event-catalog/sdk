import { join } from 'node:path';
import { rmEvent, rmEventById, writeEvent, versionEvent, getEvent, addFileToEvent, addSchemaToEvent } from './events';
import {
  rmCommand,
  rmCommandById,
  writeCommand,
  versionCommand,
  getCommand,
  addFileToCommand,
  addSchemaToCommand,
} from './commands';
import { writeService, getService, versionService, rmService, rmServiceById, addFileToService } from './services';

/**
 * Init the SDK for EventCatalog
 *
 * @param path - The path to the EventCatalog directory
 *
 */
export default (path: string) => {
  return {
    /**
     * Returns an events from EventCatalog
     * @param id - The id of the event to retrieve
     * @param version - Optional id of the version to get
     * @returns
     */
    getEvent: getEvent(join(path, 'events')),
    /**
     * Adds an event to EventCatalog
     *
     * @param event - The event to write
     * @param options - Optional options to write the event
     *
     */
    writeEvent: writeEvent(join(path, 'events')),
    /**
     * Remove an event to EventCatalog (modeled on the standard POSIX rm utility)
     *
     * @param path - The path to your event, e.g. `/Inventory/InventoryAdjusted`
     *
     */
    rmEvent: rmEvent(join(path, 'events')),
    /**
     * Remove an event by an Event id
     *
     * @param id - The id of the event you want to remove
     *
     */
    rmEventById: rmEventById(join(path, 'events')),
    /**
     * Moves a given event id to the version directory
     * @param directory
     */
    versionEvent: versionEvent(join(path, 'events')),
    /**
     * Adds a file to the given event
     * @param id - The id of the event to add the file to
     * @param file - File contents to add including the content and the file name
     * @param version - Optional version of the event to add the file to
     * @returns
     */
    addFileToEvent: addFileToEvent(join(path, 'events')),
    /**
     * Adds a schema to the given event
     * @param id - The id of the event to add the schema to
     * @param schema - Schema contents to add including the content and the file name
     * @param version - Optional version of the event to add the schema to
     * @returns
     */
    addSchemaToEvent: addSchemaToEvent(join(path, 'events')),

    /**
     * ================================
     *            Commands
     * ================================
     */

    /**
     * Returns a command from EventCatalog
     * @param id - The id of the command to retrieve
     * @param version - Optional id of the version to get
     * @returns
     */
    getCommand: getCommand(join(path, 'commands')),
    /**
     * Adds an command to EventCatalog
     *
     * @param command - The command to write
     * @param options - Optional options to write the command
     *
     */
    writeCommand: writeCommand(join(path, 'commands')),
    /**
     * Remove an command to EventCatalog (modeled on the standard POSIX rm utility)
     *
     * @param path - The path to your command, e.g. `/Inventory/InventoryAdjusted`
     *
     */
    rmCommand: rmCommand(join(path, 'commands')),
    /**
     * Remove an command by an Event id
     *
     * @param id - The id of the command you want to remove
     *
     */
    rmCommandById: rmCommandById(join(path, 'commands')),
    /**
     * Moves a given command id to the version directory
     * @param directory
     */
    versionCommand: versionCommand(join(path, 'commands')),
    /**
     * Adds a file to the given command
     * @param id - The id of the command to add the file to
     * @param file - File contents to add including the content and the file name
     * @param version - Optional version of the command to add the file to
     * @returns
     */
    addFileToCommand: addFileToCommand(join(path, 'commands')),
    /**
     * Adds a schema to the given command
     * @param id - The id of the command to add the schema to
     * @param schema - Schema contents to add including the content and the file name
     * @param version - Optional version of the command to add the schema to
     * @returns
     */
    addSchemaToCommand: addSchemaToCommand(join(path, 'commands')),

    /**
     * ================================
     *            SERVICES
     * ================================
     */

    /**
     * Adds a service to EventCatalog
     *
     * @param service - The service to write
     * @param options - Optional options to write the event
     *
     */
    writeService: writeService(join(path, 'services')),
    /**
     * Returns a service from EventCatalog
     * @param id - The id of the service to retrieve
     * @param version - Optional id of the version to get
     * @returns
     */
    getService: getService(join(path, 'services')),
    /**
     * Moves a given service id to the version directory
     * @param directory
     */
    versionService: versionService(join(path, 'services')),
    /**
     * Remove a service from EventCatalog (modeled on the standard POSIX rm utility)
     *
     * @param path - The path to your service, e.g. `/InventoryService`
     *
     */
    rmService: rmService(join(path, 'services')),
    /**
     * Remove an service by an service id
     *
     * @param id - The id of the service you want to remove
     *
     */
    rmServiceById: rmServiceById(join(path, 'services')),
    /**
     * Adds a file to the given service
     * @param id - The id of the service to add the file to
     * @param file - File contents to add including the content and the file name
     * @param version - Optional version of the service to add the file to
     * @returns
     */
    addFileToService: addFileToService(join(path, 'services')),
  };
};
