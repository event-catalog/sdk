import { join } from 'node:path';
import { rmEvent, rmEventById, writeEvent, versionEvent } from './events';

// export everything from events
export * from './events';

/**
 * Init the SDK for EventCatalog
 *
 * @param path - The path to the EventCatalog directory
 *
 */
export default (path: string) => {
  return {
    writeEvent: writeEvent(join(path, 'events')),
    rmEvent: rmEvent(join(path, 'events')),
    rmEventById: rmEventById(join(path, 'events')),
    versionEvent: versionEvent(join(path, 'events')),
  };
};
