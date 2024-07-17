import { join } from 'node:path';
import {
  rmEvent,
  rmEventById,
  writeEvent,
  versionEvent,
  getEvent,
  addFileToEvent,
  addSchemaToEvent,
} from './events';

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
  };
};
