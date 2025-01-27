import { expect, it, describe } from 'vitest';
import path from 'node:path';
import { getDomainFromService } from '../services';
import { getDomainFromEvent } from '../events';
import { getDomainFromCommand } from '../commands';

describe('Domain Retrieval', () => {
  describe('getDomainFromService', () => {
    describe('Nested structure', () => {
      const CATALOG_PATH = path.resolve(__dirname, 'fixtures/domain-retrieval/nested-structure');

      it('returns the domain associated with the service', async () => {
        expect(getDomainFromService(CATALOG_PATH)('service-a', '1.0.0')).resolves.toEqual([
          expect.objectContaining({
            id: 'domain-a',
            version: '1.0.0',
          }),
        ]);
      });

      it('returns the domain associated with the versioned service', async () => {
        expect(getDomainFromService(CATALOG_PATH)('service-a', '0.0.1')).resolves.toEqual([
          expect.objectContaining({
            id: 'domain-a',
            version: '1.0.0',
          }),
        ]);
      });

      it("returns undefined, when the service doesn't exist", async () => {
        expect(getDomainFromService(CATALOG_PATH)('non-existent-service', '0.0.0')).resolves.toBeUndefined();
      });
    });

    describe('Flat structure', () => {
      const CATALOG_PATH = path.resolve(__dirname, 'fixtures/domain-retrieval/flat-structure');

      it('returns the domain associated with the service', async () => {
        expect(getDomainFromService(CATALOG_PATH)('service-b', '1.0.0')).resolves.toEqual([
          expect.objectContaining({
            id: 'domain-a',
            version: '2.0.0',
          }),
        ]);
      });

      it('returns the latest domain associated with the service, when many versions from the same domain ID contains the service', async () => {
        expect(getDomainFromService(CATALOG_PATH)('service-a', '1.0.0')).resolves.toEqual([
          expect.objectContaining({
            id: 'domain-a',
            version: '2.0.0',
          }),
        ]);
      });

      it('returns undefined, when no domain is associated with the service', async () => {
        expect(getDomainFromService(CATALOG_PATH)('service-c', '1.0.0')).resolves.toBeUndefined();
      });

      it("returns undefined, when the service doesn't exist", async () => {
        expect(getDomainFromService(CATALOG_PATH)('non-existent-service', '0.0.0')).resolves.toBeUndefined();
      });
    });
  });

  describe('getDomainFromEvent', () => {
    describe('Nested structure', () => {
      const CATALOG_PATH = path.resolve(__dirname, 'fixtures/domain-retrieval/nested-structure');

      it('returns the domain associated with the event', async () => {
        expect(getDomainFromEvent(CATALOG_PATH)('event-a', '1.0.0')).resolves.toEqual([
          expect.objectContaining({
            id: 'domain-a',
            version: '1.0.0',
          }),
        ]);
      });

      it('returns the domain associated with the versioned event', async () => {
        expect(getDomainFromEvent(CATALOG_PATH)('event-b', '0.0.1')).resolves.toEqual([
          expect.objectContaining({
            id: 'domain-b',
            version: '1.0.0',
          }),
        ]);
      });

      it("returns undefined when the event doesn't exist", async () => {
        expect(getDomainFromEvent(CATALOG_PATH)('non-existent-event', '0.0.0')).resolves.toBeUndefined();
      });
    });

    describe('Flat structure', () => {
      const CATALOG_PATH = path.resolve(__dirname, 'fixtures/domain-retrieval/flat-structure');

      it("returns the domain associated with the event's producer", async () => {
        expect(getDomainFromEvent(CATALOG_PATH)('event-a', '1.0.0')).resolves.toEqual([
          expect.objectContaining({
            id: 'domain-a',
            version: '2.0.0',
          }),
        ]);
      });

      it("returns undefined, when the event doesn't exist", async () => {
        expect(getDomainFromEvent(CATALOG_PATH)('non-existent-event', '0.0.0')).resolves.toBeUndefined();
      });

      it('returns undefined, when the event has no producer', async () => {
        expect(getDomainFromEvent(CATALOG_PATH)('event-d', '1.0.0')).resolves.toBeUndefined();
      });

      it("returns undefined, when the event's producer has no domain association", async () => {
        expect(getDomainFromEvent(CATALOG_PATH)('event-c', '1.0.0')).resolves.toBeUndefined();
      });
    });
  });

  describe('getDomainFromCommand', () => {
    describe('Nested structure', () => {
      const CATALOG_PATH = path.join(__dirname, 'fixtures/domain-retrieval/nested-structure');

      it("returns undefined, when the command doesn't exist", async () => {
        expect(getDomainFromCommand(CATALOG_PATH)('non-existent-command', '1.0.0')).resolves.toBeUndefined();
      });

      it('returns the domain associated with the command', async () => {
        expect(getDomainFromCommand(CATALOG_PATH)('command-a', '1.0.0')).resolves.toEqual([
          expect.objectContaining({
            id: 'domain-a',
            version: '1.0.0',
          }),
        ]);
      });

      it("returns the domain associated with the command, when it's under services", async () => {
        expect(getDomainFromCommand(CATALOG_PATH)('command-aa', '1.0.0')).resolves.toEqual([
          expect.objectContaining({
            id: 'domain-a',
            version: '1.0.0',
          }),
        ]);
      });
    });

    describe('Flat structure', () => {
      const CATALOG_PATH = path.join(__dirname, 'fixtures/domain-retrieval/flat-structure/');

      it('returns undefined, when the command is not defined', async () => {
        expect(getDomainFromCommand(CATALOG_PATH)('non-defined-command', 'a')).resolves.toBeUndefined();
      });

      it('returns undefined, when the command has no contract owner (receiver)', async () => {
        expect(getDomainFromCommand(CATALOG_PATH)('command-d', '1.0.0')).resolves.toBeUndefined();
      });

      it("returns undefined, when the command's contract owner (receiver) has no domain association", async () => {
        expect(getDomainFromCommand(CATALOG_PATH)('command-c', '1.0.0')).resolves.toBeUndefined();
      });

      it("returns the domain associated with the command's contract owner (receiver)", async () => {
        expect(getDomainFromCommand(CATALOG_PATH)('command-b', '1.0.0')).resolves.toEqual([
          expect.objectContaining({
            id: 'domain-a',
            version: '2.0.0',
          }),
        ]);
      });

      it("returns the latest domain associated with the command's contract owner (receiver), when multiple versions of same domain ID are associated with the contract owner", async () => {
        expect(getDomainFromCommand(CATALOG_PATH)('command-a', '1.0.0')).resolves.toEqual([
          expect.objectContaining({
            id: 'domain-a',
            version: '2.0.0',
          }),
        ]);
      });
    });
  });

  describe('getDomainFromQuery', () => {
    describe('Nested structure', () => {
      const CATALOG_PATH = path.join(__dirname, 'fixtures/domain-retrieval/nested-structure');

      it("returns undefined, when the query doesn't exist", async () => {
        expect(getDomainFromCommand(CATALOG_PATH)('non-existent-query', '1.0.0')).resolves.toBeUndefined();
      });

      it('returns the domain associated with the query', async () => {
        expect(getDomainFromCommand(CATALOG_PATH)('query-a', '1.0.0')).resolves.toEqual([
          expect.objectContaining({
            id: 'domain-a',
            version: '1.0.0',
          }),
        ]);
      });

      it("returns the domain associated with the query, when it's under services", async () => {
        expect(getDomainFromCommand(CATALOG_PATH)('query-b', '1.0.0')).resolves.toEqual([
          expect.objectContaining({
            id: 'domain-a',
            version: '1.0.0',
          }),
        ]);
      });
    });

    describe('Flat structure', () => {
      const CATALOG_PATH = path.join(__dirname, 'fixtures/domain-retrieval/flat-structure/');

      it('returns undefined, when the query is not defined', async () => {
        expect(getDomainFromCommand(CATALOG_PATH)('non-defined-query', 'a')).resolves.toBeUndefined();
      });

      it('returns undefined, when the query has no contract owner (receiver)', async () => {
        expect(getDomainFromCommand(CATALOG_PATH)('query-d', '1.0.0')).resolves.toBeUndefined();
      });

      it("returns undefined, when the query's contract owner (receiver) has no domain association", async () => {
        expect(getDomainFromCommand(CATALOG_PATH)('query-c', '1.0.0')).resolves.toBeUndefined();
      });

      it("returns the domain associated with the query's contract owner (receiver)", async () => {
        expect(getDomainFromCommand(CATALOG_PATH)('query-b', '1.0.0')).resolves.toEqual([
          expect.objectContaining({
            id: 'domain-a',
            version: '2.0.0',
          }),
        ]);
      });

      it("returns the latest domain associated with the query's contract owner (receiver), when multiple versions of same domain ID are associated with the contract owner", async () => {
        expect(getDomainFromCommand(CATALOG_PATH)('query-a', '1.0.0')).resolves.toEqual([
          expect.objectContaining({
            id: 'domain-a',
            version: '2.0.0',
          }),
        ]);
      });
    });
  });
});
