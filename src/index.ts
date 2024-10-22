import { join } from 'node:path';
import {
  rmEvent,
  rmEventById,
  writeEvent,
  writeEventToService,
  versionEvent,
  getEvent,
  addFileToEvent,
  addSchemaToEvent,
  eventHasVersion,
} from './events';
import {
  rmCommand,
  rmCommandById,
  writeCommand,
  writeCommandToService,
  versionCommand,
  getCommand,
  addFileToCommand,
  addSchemaToCommand,
  commandHasVersion,
} from './commands';
import {
  rmQuery,
  rmQueryById,
  writeQuery,
  writeQueryToService,
  versionQuery,
  getQuery,
  addFileToQuery,
  addSchemaToQuery,
  queryHasVersion,
} from './queries';
import {
  writeService,
  writeServiceToDomain,
  getService,
  versionService,
  rmService,
  rmServiceById,
  addFileToService,
  addMessageToService,
  serviceHasVersion,
  getSpecificationFilesForService,
  writeVersionedService,
} from './services';
import {
  writeDomain,
  getDomain,
  versionDomain,
  rmDomain,
  rmDomainById,
  addFileToDomain,
  domainHasVersion,
  addServiceToDomain,
} from './domains';

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
     * @returns Event|Undefined
     */
    getEvent: getEvent(join(path)),
    /**
     * Adds an event to EventCatalog
     *
     * @param event - The event to write
     * @param options - Optional options to write the event
     *
     */
    writeEvent: writeEvent(join(path, 'events')),
    /**
     * Adds an event to a service in EventCatalog
     *
     * @param event - The event to write to the service
     * @param service - The service and it's id to write to the event to
     * @param options - Optional options to write the event
     *
     */
    writeEventToService: writeEventToService(join(path, 'services')),
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
    rmEventById: rmEventById(join(path)),
    /**
     * Moves a given event id to the version directory
     * @param directory
     */
    versionEvent: versionEvent(join(path)),
    /**
     * Adds a file to the given event
     * @param id - The id of the event to add the file to
     * @param file - File contents to add including the content and the file name
     * @param version - Optional version of the event to add the file to
     * @returns
     */
    addFileToEvent: addFileToEvent(join(path)),
    /**
     * Adds a schema to the given event
     * @param id - The id of the event to add the schema to
     * @param schema - Schema contents to add including the content and the file name
     * @param version - Optional version of the event to add the schema to
     * @returns
     */
    addSchemaToEvent: addSchemaToEvent(join(path)),
    /**
     * Check to see if an event version exists
     * @param id - The id of the event
     * @param version - The version of the event (supports semver)
     * @returns
     */
    eventHasVersion: eventHasVersion(join(path)),

    /**
     * ================================
     *            Commands
     * ================================
     */

    /**
     * Returns a command from EventCatalog
     * @param id - The id of the command to retrieve
     * @param version - Optional id of the version to get (supports semver)
     * @returns Command|Undefined
     */
    getCommand: getCommand(join(path)),
    /**
     * Adds an command to EventCatalog
     *
     * @param command - The command to write
     * @param options - Optional options to write the command
     *
     */
    writeCommand: writeCommand(join(path, 'commands')),

    /**
     * Adds a command to a service in EventCatalog
     *
     * @param command - The command to write to the service
     * @param service - The service and it's id to write to the command to
     * @param options - Optional options to write the command
     *
     */
    writeCommandToService: writeCommandToService(join(path, 'services')),

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
    rmCommandById: rmCommandById(join(path)),
    /**
     * Moves a given command id to the version directory
     * @param directory
     */
    versionCommand: versionCommand(join(path)),
    /**
     * Adds a file to the given command
     * @param id - The id of the command to add the file to
     * @param file - File contents to add including the content and the file name
     * @param version - Optional version of the command to add the file to
     * @returns
     */
    addFileToCommand: addFileToCommand(join(path)),
    /**
     * Adds a schema to the given command
     * @param id - The id of the command to add the schema to
     * @param schema - Schema contents to add including the content and the file name
     * @param version - Optional version of the command to add the schema to
     * @returns
     */
    addSchemaToCommand: addSchemaToCommand(join(path)),

    /**
     * Check to see if a command version exists
     * @param id - The id of the command
     * @param version - The version of the command (supports semver)
     * @returns
     */
    commandHasVersion: commandHasVersion(join(path)),

    /**
     * ================================
     *            Queries
     * ================================
     */

    /**
     * Returns a query from EventCatalog
     * @param id - The id of the query to retrieve
     * @param version - Optional id of the version to get (supports semver)
     * @returns Query|Undefined
     */
    getQuery: getQuery(join(path)),
    /**
     * Adds a query to EventCatalog
     *
     * @param query - The query to write
     * @param options - Optional options to write the event
     *
     */
    writeQuery: writeQuery(join(path, 'queries')),
    /**
     * Adds a query to a service in EventCatalog
     *
     * @param query - The query to write to the service
     * @param service - The service and it's id to write to the query to
     * @param options - Optional options to write the query
     *
     */
    writeQueryToService: writeQueryToService(join(path, 'services')),
    /**
     * Remove an query to EventCatalog (modeled on the standard POSIX rm utility)
     *
     * @param path - The path to your query, e.g. `/Orders/GetOrder`
     *
     */
    rmQuery: rmQuery(join(path, 'queries')),
    /**
     * Remove a query by a Query id
     *
     * @param id - The id of the query you want to remove
     *
     */
    rmQueryById: rmQueryById(join(path)),
    /**
     * Moves a given query id to the version directory
     * @param directory
     */
    versionQuery: versionQuery(join(path)),
    /**
     * Adds a file to the given query
     * @param id - The id of the query to add the file to
     * @param file - File contents to add including the content and the file name
     * @param version - Optional version of the query to add the file to
     * @returns
     */
    addFileToQuery: addFileToQuery(join(path)),
    /**
     * Adds a schema to the given query
     * @param id - The id of the query to add the schema to
     * @param schema - Schema contents to add including the content and the file name
     * @param version - Optional version of the query to add the schema to
     * @returns
     */
    addSchemaToQuery: addSchemaToQuery(join(path)),
    /**
     * Check to see if an query version exists
     * @param id - The id of the query
     * @param version - The version of the query (supports semver)
     * @returns
     */
    queryHasVersion: queryHasVersion(join(path)),

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
     * Adds a versioned service to EventCatalog
     *
     * @param service - The service to write
     *
     */
    writeVersionedService: writeVersionedService(join(path, 'services')),

    /**
     * Adds a service to a domain in EventCatalog
     *
     * @param service - The service to write
     * @param domain - The domain to add the service to
     * @param options - Optional options to write the event
     *
     */
    writeServiceToDomain: writeServiceToDomain(join(path, 'domains')),
    /**
     * Returns a service from EventCatalog
     * @param id - The id of the service to retrieve
     * @param version - Optional id of the version to get (supports semver)
     * @returns Service|Undefined
     */
    getService: getService(join(path)),
    /**
     * Moves a given service id to the version directory
     * @param directory
     */
    versionService: versionService(join(path)),
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
    rmServiceById: rmServiceById(join(path)),
    /**
     * Adds a file to the given service
     * @param id - The id of the service to add the file to
     * @param file - File contents to add including the content and the file name
     * @param version - Optional version of the service to add the file to
     * @returns
     */
    addFileToService: addFileToService(join(path)),

    /**
     * Returns the specifications for a given service
     * @param id - The id of the service to retrieve the specifications for
     * @param version - Optional version of the service
     * @returns
     */
    getSpecificationFilesForService: getSpecificationFilesForService(join(path)),

    /**
     * Check to see if a service version exists
     * @param id - The id of the service
     * @param version - The version of the service (supports semver)
     * @returns
     */
    serviceHasVersion: serviceHasVersion(join(path)),

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
     * @returns Domain|Undefined
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
    addEventToService: addMessageToService(join(path)),
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
    addCommandToService: addMessageToService(join(path)),

    /**
     * Check to see if a domain version exists
     * @param id - The id of the domain
     * @param version - The version of the domain (supports semver)
     * @returns
     */
    domainHasVersion: domainHasVersion(join(path)),

    /**
     * Adds a given service to a domain
     * @param id - The id of the domain
     * @param service - The id and version of the service to add
     * @param version - (Optional) The version of the domain to add the service to
     * @returns
     */
    addServiceToDomain: addServiceToDomain(join(path, 'domains')),
  };
};
