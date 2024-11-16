import fs from 'node:fs/promises';
import { join } from 'node:path';
import type { User } from './types';
import matter from 'gray-matter';
import { getFiles } from './internal/utils';

/**
 * Returns a user from EventCatalog.
 *
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { getUser } = utils('/path/to/eventcatalog');
 *
 * // Gets the user with the given id
 * const user = await getUser('eventcatalog-core-user');
 *
 * ```
 */
export const getUser =
  (catalogDir: string) =>
  async (id: string): Promise<User | undefined> => {
    const files = await getFiles(`${catalogDir}/${id}.md`);

    if (files.length == 0) return undefined;
    const file = files[0];

    const { data, content } = matter.read(file);
    return {
      ...data,
      id: data.id,
      name: data.name,
      markdown: content.trim(),
    } as User;

  }

/**
 * Returns all users from EventCatalog.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { getUsers } = utils('/path/to/eventcatalog');
 *
 * // Gets all users from the catalog
 * const channels = await getUsers();
 *
 * ```
 */
export const getUsers =
  (catalogDir: string) =>
  async (options?: { }): Promise<User[]> => {
    const files = await getFiles(`${catalogDir}/users/*.md`);
    if (files.length === 0) return [];

    return files.map((file) => {
      const { data, content } = matter.read(file);
      return {
        ...data,
        id: data.id,
        name: data.name,
        markdown: content.trim(),
      } as User;
    });
  }

/**
 * Write a user to EventCatalog.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { writeUser } = utils('/path/to/eventcatalog');
 *
 * // Write a user to the catalog
 * // user would be written to users/eventcatalog-tech-lead
 * await writeUser({
 *   id: 'eventcatalog-tech-lead',
 *   name: 'EventCatalog Tech Lead',
 *   email: 'test@test.com',
 *   slackDirectMessageUrl: https://yourteam.slack.com/channels/boyney123
 * });
 *
 * // Write a channel to the catalog and override the existing content (if there is any)
 * await writeUser({
 *   id: 'eventcatalog-tech-lead',
 *   name: 'EventCatalog Tech Lead',
 *   email: 'test@test.com',
 *   slackDirectMessageUrl: https://yourteam.slack.com/channels/boyney123
 * }, { override: true });
 *
 * ```
 */
export const writeUser =
  (catalogDir: string) =>
  async (user: User, options: { override?: boolean} = { }) => {
    const resource: User = { ...user };

    // Get the path
    const currentUser = await getUser(catalogDir)(resource.id);
    const exists = currentUser !== undefined;

    if (exists && !options.override) {
      throw new Error(`Failed to write ${resource.id} (user) as it already exists`);
    }

    const { markdown, ...frontmatter } = resource;

    const document = matter.stringify(markdown, frontmatter);
    await fs.mkdir(join(catalogDir, ''), { recursive: true });
    await fs.writeFile(join(catalogDir, '', `${resource.id}.md`), document);

  };

/**
 * Delete a user by it's id.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { rmUserById } = utils('/path/to/eventcatalog');
 *
 * // deletes the user with id eventcatalog-core-user
 * await rmUserById('eventcatalog-core-user');
 *
 * ```
 */
export const rmUserById = (catalogDir: string) => async (id: string) => {
  await fs.rm(join(catalogDir, `${id}.md`), { recursive: true });
};