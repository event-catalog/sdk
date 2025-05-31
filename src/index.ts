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
  getEvents,
} from './events';
import {
  rmCommand,
  rmCommandById,
  writeCommand,
  writeCommandToService,
  versionCommand,
  getCommand,
  getCommands,
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
  getQueries,
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
  getServices,
} from './services';
import {
  writeDomain,
  getDomain,
  getDomains,
  versionDomain,
  rmDomain,
  rmDomainById,
  addFileToDomain,
  addUbiquitousLanguageToDomain,
  domainHasVersion,
  addServiceToDomain,
  addSubDomainToDomain,
  getUbiquitousLanguageFromDomain,
} from './domains';

import {
  rmChannel,
  rmChannelById,
  writeChannel,
  versionChannel,
  getChannel,
  getChannels,
  channelHasVersion,
  addMessageToChannel,
} from './channels';

import { getMessageBySchemaPath, getProducersAndConsumersForMessage } from './messages';

import { getResourcePath } from './internal/resources';

import { writeCustomDoc, getCustomDoc, getCustomDocs, rmCustomDoc } from './custom-docs';

import { writeTeam, getTeam, getTeams, rmTeamById } from './teams';

import { writeUser, getUser, getUsers, rmUserById } from './users';
import { dumpCatalog, getEventCatalogConfigurationFile } from './eventcatalog';

// Export the types
export type * from './types';

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
     * Returns all events from EventCatalog
     * @param latestOnly - optional boolean, set to true to get only latest versions
     * @returns Event[]|Undefined
     */
    getEvents: getEvents(join(path)),
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
    writeEventToService: writeEventToService(join(path)),
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
     * Returns all commands from EventCatalog
     * @param latestOnly - optional boolean, set to true to get only latest versions
     * @returns Command[]|Undefined
     */
    getCommands: getCommands(join(path)),
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
    writeCommandToService: writeCommandToService(join(path)),

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
     * Returns all queries from EventCatalog
     * @param latestOnly - optional boolean, set to true to get only latest versions
     * @returns Query[]|Undefined
     */
    getQueries: getQueries(join(path)),
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
    writeQueryToService: writeQueryToService(join(path)),
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
     *            Channels
     * ================================
     */

    /**
     * Returns a channel from EventCatalog
     * @param id - The id of the channel to retrieve
     * @param version - Optional id of the version to get (supports semver)
     * @returns Channel|Undefined
     */
    getChannel: getChannel(join(path)),
    /**
     * Returns all channels from EventCatalog
     * @param latestOnly - optional boolean, set to true to get only latest versions
     * @returns Channel[]|Undefined
     */
    getChannels: getChannels(join(path)),
    /**
     * Adds an channel to EventCatalog
     *
     * @param command - The channel to write
     * @param options - Optional options to write the channel
     *
     */
    writeChannel: writeChannel(join(path, 'channels')),

    /**
     * Remove an channel to EventCatalog (modeled on the standard POSIX rm utility)
     *
     * @param path - The path to your channel, e.g. `/Inventory/InventoryAdjusted`
     *
     */
    rmChannel: rmChannel(join(path, 'channels')),
    /**
     * Remove an channel by an Event id
     *
     * @param id - The id of the channel you want to remove
     *
     */
    rmChannelById: rmChannelById(join(path)),
    /**
     * Moves a given channel id to the version directory
     * @param directory
     */
    versionChannel: versionChannel(join(path)),

    /**
     * Check to see if a channel version exists
     * @param id - The id of the channel
     * @param version - The version of the channel (supports semver)
     * @returns
     */
    channelHasVersion: channelHasVersion(join(path)),

    /**
     * Add a channel to an event
     *
     * Optionally specify a version to add the channel to a specific version of the event.
     *
     * @example
     * ```ts
     * import utils from '@eventcatalog/utils';
     *
     * const { addEventToChannel } = utils('/path/to/eventcatalog');
     *
     * // adds a new event (InventoryUpdatedEvent) to the inventory.{env}.events channel
     * await addEventToChannel('inventory.{env}.events channel', { id: 'InventoryUpdatedEvent', version: '2.0.0', parameters: { env: 'dev' } });
     *
     * ```
     */
    addEventToChannel: addMessageToChannel(join(path), 'events'),
    /**
     * Add a channel to an command
     *
     * Optionally specify a version to add the channel to a specific version of the command.
     *
     * @example
     * ```ts
     * import utils from '@eventcatalog/utils';
     *
     * const { addCommandToChannel } = utils('/path/to/eventcatalog');
     *
     * // adds a new command (UpdateInventory) to the inventory.{env}.events channel
     * await addCommandToChannel('inventory.{env}.events channel', { id: 'UpdateInventory', version: '2.0.0', parameters: { env: 'dev' } });
     *
     * ```
     */
    addCommandToChannel: addMessageToChannel(join(path), 'commands'),

    /**
     * Add a channel to an query
     *
     * Optionally specify a version to add the channel to a specific version of the query.
     *
     * @example
     * ```ts
     * import utils from '@eventcatalog/utils';
     *
     * const { addQueryToChannel } = utils('/path/to/eventcatalog');
     *
     * // adds a new query (GetInventory) to the inventory.{env}.events channel
     * await addQueryToChannel('inventory.{env}.events channel', { id: 'GetInventory', version: '2.0.0', parameters: { env: 'dev' } });
     *
     * ```
     */
    addQueryToChannel: addMessageToChannel(join(path), 'queries'),

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
     * Returns all services from EventCatalog
     * @param latestOnly - optional boolean, set to true to get only latest versions
     * @returns Service[]|Undefined
     */
    getServices: getServices(join(path)),
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
     * Add a query to a service by it's id.
     *
     * Optionally specify a version to add the event to a specific version of the service.
     *
     * @example
     * ```ts
     * import utils from '@eventcatalog/utils';
     *
     * const { addQueryToService } = utils('/path/to/eventcatalog');
     *
     * // adds a new query (UpdateInventory) that the InventoryService will send
     * await addQueryToService('InventoryService', 'sends', { command: 'UpdateInventory', version: '2.0.0' });
     *
     * // adds a new command (VerifyInventory) that the InventoryService will receive
     * await addQueryToService('InventoryService', 'receives', { command: 'VerifyInventory', version: '2.0.0' });
     *
     * ```
     */
    addQueryToService: addMessageToService(join(path)),

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
     * Returns all domains from EventCatalog
     * @param latestOnly - optional boolean, set to true to get only latest versions
     * @returns Domain[]|Undefined
     */
    getDomains: getDomains(join(path)),
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
     * Adds an ubiquitous language dictionary to a domain
     * @param id - The id of the domain to add the ubiquitous language to
     * @param ubiquitousLanguageDictionary - The ubiquitous language dictionary to add
     * @param version - Optional version of the domain to add the ubiquitous language to
     */
    addUbiquitousLanguageToDomain: addUbiquitousLanguageToDomain(join(path, 'domains')),

    /**
     * Get the ubiquitous language dictionary from a domain
     * @param id - The id of the domain to get the ubiquitous language from
     * @param version - Optional version of the domain to get the ubiquitous language from
     * @returns
     */
    getUbiquitousLanguageFromDomain: getUbiquitousLanguageFromDomain(join(path, 'domains')),

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

    /**
     * Adds a given subdomain to a domain
     * @param id - The id of the domain
     * @param subDomain - The id and version of the subdomain to add
     * @param version - (Optional) The version of the domain to add the subdomain to
     * @returns
     */
    addSubDomainToDomain: addSubDomainToDomain(join(path, 'domains')),

    /**
     * ================================
     *            Teams
     * ================================
     */
    /**
     * Adds a team to EventCatalog
     *
     * @param team - The team to write
     * @param options - Optional options to write the team
     *
     */
    writeTeam: writeTeam(join(path, 'teams')),
    /**
     * Returns a team from EventCatalog
     * @param id - The id of the team to retrieve
     * @returns Team|Undefined
     */
    getTeam: getTeam(join(path, 'teams')),
    /**
     * Returns all teams from EventCatalog
     * @returns Team[]|Undefined
     */
    getTeams: getTeams(join(path)),
    /**
     * Remove a team by the team id
     *
     * @param id - The id of the team you want to remove
     *
     */
    rmTeamById: rmTeamById(join(path, 'teams')),

    /**
     * ================================
     *            Users
     * ================================
     */
    /**
     * Adds a user to EventCatalog
     *
     * @param user - The user to write
     * @param options - Optional options to write the user
     *
     */
    writeUser: writeUser(join(path, 'users')),
    /**
     * Returns a user from EventCatalog
     * @param id - The id of the user to retrieve
     * @returns User|Undefined
     */
    getUser: getUser(join(path, 'users')),
    /**
     * Returns all user from EventCatalog
     * @returns User[]|Undefined
     */
    getUsers: getUsers(join(path)),
    /**
     * Remove a user by the user id
     *
     * @param id - The id of the user you want to remove
     *
     */
    rmUserById: rmUserById(join(path, 'users')),

    /**
     * ================================
     *            Custom Docs
     * ================================
     */

    /**
     * Returns a custom doc from EventCatalog
     * @param path - The path to the custom doc to retrieve
     * @returns CustomDoc|Undefined
     */
    getCustomDoc: getCustomDoc(join(path, 'docs')),
    /**
     * Returns all custom docs from EventCatalog
     * @param options - Optional options to get custom docs from a specific path
     * @returns CustomDoc[]|Undefined
     */
    getCustomDocs: getCustomDocs(join(path, 'docs')),
    /**
     * Writes a custom doc to EventCatalog
     * @param customDoc - The custom doc to write
     * @param options - Optional options to write the custom doc
     *
     */
    writeCustomDoc: writeCustomDoc(join(path, 'docs')),

    /**
     * Removes a custom doc from EventCatalog
     * @param path - The path to the custom doc to remove
     *
     */
    rmCustomDoc: rmCustomDoc(join(path, 'docs')),

    /**
     * Dumps the catalog to a JSON file.
     * @param directory - The directory to dump the catalog to
     * @returns A JSON file with the catalog
     */
    dumpCatalog: dumpCatalog(join(path)),

    /**
     * Returns the event catalog configuration file.
     * The event catalog configuration file is the file that contains the configuration for the event catalog.
     *
     * @param directory - The directory of the catalog.
     * @returns A JSON object with the configuration for the event catalog.
     */
    getEventCatalogConfigurationFile: getEventCatalogConfigurationFile(join(path)),
    /**
     * ================================
     *            Resources Utils
     * ================================
     */

    /**
     * Returns the path to a given resource by id and version
     */
    getResourcePath: getResourcePath,

    /**
     * ================================
     *            General Message Utils
     * ================================
     */

    /**
     * Returns a message from EventCatalog by a given schema path.
     *
     * @param path - The path to the message to retrieve
     * @returns Message|Undefined
     */
    getMessageBySchemaPath: getMessageBySchemaPath(join(path)),

    /**
     * Returns the producers and consumers (services) for a given message
     * @param id - The id of the message to get the producers and consumers for
     * @param version - Optional version of the message
     * @returns { producers: Service[], consumers: Service[] }
     */
    getProducersAndConsumersForMessage: getProducersAndConsumersForMessage(join(path)),
  };
};
