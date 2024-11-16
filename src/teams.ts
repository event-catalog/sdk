import fs from 'node:fs/promises';
import { join } from 'node:path';
import type { Team } from './types';
import matter from 'gray-matter';
import { getFiles } from './internal/utils';

/**
 * Returns a team from EventCatalog.
 *
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { getTeam } = utils('/path/to/eventcatalog');
 *
 * // Gets the team with the given id
 * const team = await getTeam('eventcatalog-core-team');
 *
 * ```
 */
export const getTeam =
  (catalogDir: string) =>
  async (id: string): Promise<Team | undefined> => {
    const files = await getFiles(`${catalogDir}/${id}.md`);

    if (files.length == 0) return undefined;
    const file = files[0];

    const { data, content } = matter.read(file);
    return {
      ...data,
      id: data.id,
      name: data.name,
      markdown: content.trim(),
    } as Team;
  };

/**
 * Returns all teams from EventCatalog.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { getTeams } = utils('/path/to/eventcatalog');
 *
 * // Gets all teams from the catalog
 * const channels = await getTeams();
 *
 * ```
 */
export const getTeams =
  (catalogDir: string) =>
  async (options?: {}): Promise<Team[]> => {
    const files = await getFiles(`${catalogDir}/teams/*.md`);
    if (files.length === 0) return [];

    return files.map((file) => {
      const { data, content } = matter.read(file);
      return {
        ...data,
        id: data.id,
        name: data.name,
        markdown: content.trim(),
      } as Team;
    });
  };

/**
 * Write a team to EventCatalog.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { writeTeam } = utils('/path/to/eventcatalog');
 *
 * // Write a team to the catalog
 * // team would be written to teams/EventCatalogCoreTeam
 * await writeTeam({
 *   id: 'eventcatalog-core-team',
 *   name: 'EventCatalogCoreTeam',
 *   members: ['dboyne', 'asmith', 'msmith'],
 *   email: 'test@test.com',
 *   slackDirectMessageUrl: https://yourteam.slack.com/channels/boyney123
 * });
 *
 * // Write a channel to the catalog and override the existing content (if there is any)
 * await writeTeam({
 *   id: 'eventcatalog-core-team',
 *   name: 'EventCatalogCoreTeam',
 *   members: ['dboyne', 'asmith', 'msmith'],
 *   email: 'test@test.com',
 *   slackDirectMessageUrl: https://yourteam.slack.com/channels/boyney123
 * }, { override: true });
 *
 * ```
 */
export const writeTeam =
  (catalogDir: string) =>
  async (team: Team, options: { override?: boolean } = {}) => {
    const resource: Team = { ...team };

    // Get the path
    const currentTeam = await getTeam(catalogDir)(resource.id);
    const exists = currentTeam !== undefined;

    if (exists && !options.override) {
      throw new Error(`Failed to write ${resource.id} (team) as it already exists`);
    }

    const { markdown, ...frontmatter } = resource;

    const document = matter.stringify(markdown, frontmatter);
    await fs.mkdir(join(catalogDir, ''), { recursive: true });
    await fs.writeFile(join(catalogDir, '', `${resource.id}.md`), document);
  };

/**
 * Delete a team by it's id.
 *
 * @example
 * ```ts
 * import utils from '@eventcatalog/utils';
 *
 * const { rmTeamById } = utils('/path/to/eventcatalog');
 *
 * // deletes the EventCatalogCoreTeam team
 * await rmTeamById('eventcatalog-core-team');
 *
 * ```
 */
export const rmTeamById = (catalogDir: string) => async (id: string) => {
  await fs.rm(join(catalogDir, `${id}.md`), { recursive: true });
};
