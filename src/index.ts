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
import {
  writeService,
  getService,
  versionService,
  rmService,
  rmServiceById,
  addFileToService,
  addMessageToService,
} from './services';
import { writeDomain, getDomain, versionDomain, rmDomain, rmDomainById, addFileToDomain } from './domains';

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
     * @param version - Optional id of the version to get (supports semver)
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
     * @param version - Optional id of the version to get (supports semver)
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
     * @param version - Optional id of the version to get (supports semver)
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

    /**
     * ================================
     *            Domains
     * ================================
     */

    /**
     * Adds a domain to EventCatalog
     *
     * @param domain - The domain to write
     * @param options - Optional options to write the event
     *
     */
    writeDomain: writeDomain(join(path, 'domains')),
    /**
     * Returns a domain from EventCatalog
     * @param id - The id of the domain to retrieve
     * @param version - Optional id of the version to get (supports semver)
     * @returns
     */
    getDomain: getDomain(join(path, 'domains')),
    /**
     * Moves a given domain id to the version directory
     * @param directory
     */
    versionDomain: versionDomain(join(path, 'domains')),
    /**
     * Remove a domain from EventCatalog (modeled on the standard POSIX rm utility)
     *
     * @param path - The path to your domain, e.g. `/Payment`
     *
     */
    rmDomain: rmDomain(join(path, 'domains')),
    /**
     * Remove an service by an domain id
     *
     * @param id - The id of the domain you want to remove
     *
     */
    rmDomainById: rmDomainById(join(path, 'domains')),
    /**
     * Adds a file to the given domain
     * @param id - The id of the domain to add the file to
     * @param file - File contents to add including the content and the file name
     * @param version - Optional version of the domain to add the file to
     * @returns
     */
    addFileToDomain: addFileToDomain(join(path, 'domains')),
    /**
     * Add an event to a service by it's id.
     *
     * Optionally specify a version to add the event to a specific version of the service.
     *
     * @example
     * ```ts
     * import utils from '@eventcatalog/utils';
     *
     * const { addEventToService } = utils('/path/to/eventcatalog');
     *
     * // adds a new event (InventoryUpdatedEvent) that the InventoryService will send
     * await addEventToService('InventoryService', 'sends', { event: 'InventoryUpdatedEvent', version: '2.0.0' });
     *
     * // adds a new event (OrderComplete) that the InventoryService will receive
     * await addEventToService('InventoryService', 'receives', { event: 'OrderComplete', version: '2.0.0' });
     *
     * ```
     */
    addEventToService: addMessageToService(join(path, 'services')),
    /**
     * Add a command to a service by it's id.
     *
     * Optionally specify a version to add the event to a specific version of the service.
     *
     * @example
     * ```ts
     * import utils from '@eventcatalog/utils';
     *
     * const { addCommandToService } = utils('/path/to/eventcatalog');
     *
     * // adds a new command (UpdateInventoryCommand) that the InventoryService will send
     * await addCommandToService('InventoryService', 'sends', { command: 'UpdateInventoryCommand', version: '2.0.0' });
     *
     * // adds a new command (VerifyInventory) that the InventoryService will receive
     * await addCommandToService('InventoryService', 'receives', { command: 'VerifyInventory', version: '2.0.0' });
     *
     * ```
     */
    addCommandToService: addMessageToService(join(path, 'services')),
  };
};
