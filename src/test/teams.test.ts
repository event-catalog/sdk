// teams.test.js
import { expect, it, describe, beforeEach, afterEach } from 'vitest';
import utils from '../index';
import path from 'node:path';
import fs from 'node:fs';

const CATALOG_PATH = path.join(__dirname, 'catalog-teams');

const { writeTeam, getTeam, getTeams, rmTeamById } = utils(CATALOG_PATH);

// clean the catalog before each test
beforeEach(() => {
  fs.rmSync(CATALOG_PATH, { recursive: true, force: true });
  fs.mkdirSync(CATALOG_PATH, { recursive: true });
});

afterEach(() => {
  fs.rmSync(CATALOG_PATH, { recursive: true, force: true });
});

describe('Teams SDK', () => {
  describe('getTeam', () => {
    it('returns the given team by id from EventCatalog,', async () => {
      await writeTeam({
        id: 'eventcatalog-core-team',
        name: 'Eventcatalog Core Team',
        markdown: 'This is the core team for Eventcatalog',
      });

      const test = await getTeam('eventcatalog-core-team');

      expect(test).toEqual({
        id: 'eventcatalog-core-team',
        name: 'Eventcatalog Core Team',
        markdown: 'This is the core team for Eventcatalog',
      });
    });

    it('returns undefined when the team is not found', async () => {
      await expect(await getTeam('unknown-team')).toEqual(undefined);
    });
  });

  describe('getTeams', () => {
    it('returns all the teams in the catalog,', async () => {
      await writeTeam({
        id: 'eventcatalog-core-team',
        name: 'Eventcatalog Core Team',
        markdown: 'This is the core team for Eventcatalog',
      });

      await writeTeam({
        id: 'eventcatalog-second-team',
        name: 'Eventcatalog Second Team',
        markdown: 'This is the second team for Eventcatalog',
      });

      const teams = await getTeams();

      expect(teams).toEqual([
        {
          id: 'eventcatalog-second-team',
          name: 'Eventcatalog Second Team',
          markdown: 'This is the second team for Eventcatalog',
        },
        {
          id: 'eventcatalog-core-team',
          name: 'Eventcatalog Core Team',
          markdown: 'This is the core team for Eventcatalog',
        },
      ]);
    });
  });

  describe('writeTeam', () => {
    it('writes the given team to EventCatalog and assumes the path if one if not given', async () => {
      await writeTeam({
        id: 'eventcatalog-core-team',
        name: 'Eventcatalog Core Team',
        markdown: 'This is the core team for Eventcatalog',
      });

      const team = await getTeam('eventcatalog-core-team');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'teams', 'eventcatalog-core-team.md'))).toBe(true);

      expect(team).toEqual({
        id: 'eventcatalog-core-team',
        name: 'Eventcatalog Core Team',
        markdown: 'This is the core team for Eventcatalog',
      });
    });

    it('throws an error when trying to write a team that already exists', async () => {
      await writeTeam({
        id: 'eventcatalog-core-team',
        name: 'Eventcatalog Core Team',
        markdown: 'This is the core team for Eventcatalog',
      });

      await expect(
        writeTeam({
          id: 'eventcatalog-core-team',
          name: 'Eventcatalog Core Team',
          markdown: 'This is the core team for Eventcatalog',
        })
      ).rejects.toThrowError('Failed to write eventcatalog-core-team (team) as it already exists');
    });

    it('overrides the domain when trying to write an domain that already exists and override is true', async () => {
      await writeTeam({
        id: 'eventcatalog-core-team',
        name: 'Eventcatalog Core Team',
        markdown: 'This is the core team for Eventcatalog',
      });

      await writeTeam(
        {
          id: 'eventcatalog-core-team',
          name: 'Eventcatalog Core Team Overridden',
          markdown: 'This is the core team for Eventcatalog',
        },
        { override: true }
      );

      const team = await getTeam('eventcatalog-core-team');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'teams', 'eventcatalog-core-team.md'))).toBe(true);
      expect(team.name).toBe('Eventcatalog Core Team Overridden');
    });
  });

  describe('rmTeamById', () => {
    it('removes a team from eventcatalog by id', async () => {
      await writeTeam({
        id: 'eventcatalog-core-team',
        name: 'Eventcatalog Core Team',
        markdown: 'This is the core team for Eventcatalog',
      });

      expect(fs.existsSync(path.join(CATALOG_PATH, 'teams', 'eventcatalog-core-team.md'))).toBe(true);

      await rmTeamById('eventcatalog-core-team');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'teams', 'eventcatalog-core-team.md'))).toBe(false);
    });
  });
});
