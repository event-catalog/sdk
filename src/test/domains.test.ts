// sum.test.js
import { expect, it, describe, beforeEach, afterEach } from 'vitest';
import utils from '../index';
import path from 'node:path';
import fs from 'node:fs';

const CATALOG_PATH = path.join(__dirname, 'catalog-domains');

const { writeDomain, getDomain, versionDomain, rmDomain, rmDomainById, addFileToDomain } = utils(CATALOG_PATH);

// clean the catalog before each test
beforeEach(() => {
  fs.rmSync(CATALOG_PATH, { recursive: true, force: true });
  fs.mkdirSync(CATALOG_PATH, { recursive: true });
});

afterEach(() => {
  fs.rmSync(CATALOG_PATH, { recursive: true, force: true });
});

describe('Domain SDK', () => {
  describe('getDomain', () => {
    it('returns the given domain id from EventCatalog and the latest version when no version is given,', async () => {
      await writeDomain({
        id: 'Payment',
        name: 'Payment Domain',
        version: '0.0.1',
        summary: 'All things to do with the payment systems',
        markdown: '# Hello world',
      });

      const test = await getDomain('Payment');

      expect(test).toEqual({
        id: 'Payment',
        name: 'Payment Domain',
        version: '0.0.1',
        summary: 'All things to do with the payment systems',
        markdown: '# Hello world',
      });
    });

    it('returns the given domain id from EventCatalog and the requested version when a version is given,', async () => {
      await writeDomain({
        id: 'Payment',
        name: 'Payment Domain',
        version: '0.0.1',
        summary: 'All things to do with the payment systems',
        markdown: '# Hello world',
      });

      await versionDomain('Payment');

      await writeDomain({
        id: 'Payment',
        name: 'Payment Domain',
        version: '1.0.0',
        summary: 'All things to do with the payment systems',
        markdown: '# Hello world',
      });

      const test = await getDomain('Payment', '0.0.1');

      expect(test).toEqual({
        id: 'Payment',
        name: 'Payment Domain',
        version: '0.0.1',
        summary: 'All things to do with the payment systems',
        markdown: '# Hello world',
      });
    });

    it('throws an error if the domain is not found', async () => {
      await expect(getDomain('Payment')).rejects.toThrowError('No domain found for the given id: Payment');
    });

    it('throws an error if the domain is found but not the version', async () => {
      await writeDomain({
        id: 'Payment',
        name: 'Payment Domain',
        version: '0.0.1',
        summary: 'All things to do with the payment systems',
        markdown: '# Hello world',
      });

      await expect(getDomain('Payment', '1.0.0')).rejects.toThrowError(
        'No domain found for the given id: Payment and version 1.0.0'
      );
    });
  });

  describe('writeDomain', () => {
    it('writes the given domain to EventCatalog and assumes the path if one if not given', async () => {
      await writeDomain({
        id: 'Payment',
        name: 'Payment Domain',
        version: '0.0.1',
        summary: 'All things to do with the payment systems',
        markdown: '# Hello world',
      });

      const domain = await getDomain('Payment');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'domains/Payment', 'index.md'))).toBe(true);

      expect(domain).toEqual({
        id: 'Payment',
        name: 'Payment Domain',
        version: '0.0.1',
        summary: 'All things to do with the payment systems',
        markdown: '# Hello world',
      });
    });

    it('writes the given domain to EventCatalog under the correct path when a path is given', async () => {
      await writeDomain(
        {
          id: 'Payment',
          name: 'Payment Domain',
          version: '0.0.1',
          summary: 'All things to do with the payment systems',
          markdown: '# Hello world',
        },
        { path: '/Inventory/Payment' }
      );

      expect(fs.existsSync(path.join(CATALOG_PATH, 'domains/Inventory/Payment', 'index.md'))).toBe(true);
    });

    it('throws an error when trying to write an domain that already exists', async () => {
      await writeDomain({
        id: 'Payment',
        name: 'Payment Domain',
        version: '0.0.1',
        summary: 'All things to do with the payment systems',
        markdown: '# Hello world',
      });

      await expect(
        writeDomain({
          id: 'Payment',
          name: 'Payment Domain',
          version: '0.0.1',
          summary: 'All things to do with the payment systems',
          markdown: '# Hello world',
        })
      ).rejects.toThrowError('Failed to write domain as the version 0.0.1 already exists');
    });
  });

  describe('versionDomain', () => {
    it('adds the given domain to the versioned directory and removes itself from the root', async () => {
      await writeDomain({
        id: 'Payment',
        name: 'Payment Domain',
        version: '0.0.1',
        summary: 'All things to do with the payment systems',
        markdown: '# Hello world',
      });

      await versionDomain('Payment');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'domains/Payment/versioned/0.0.1', 'index.md'))).toBe(true);
      expect(fs.existsSync(path.join(CATALOG_PATH, 'domains/Payment', 'index.md'))).toBe(false);
    });
    it('adds the given domain to the versioned directory and all files that are associated to it', async () => {
      await writeDomain({
        id: 'Payment',
        name: 'Payment Domain',
        version: '0.0.1',
        summary: 'All things to do with the payment systems',
        markdown: '# Hello world',
      });

      // Add random file in there
      await fs.writeFileSync(path.join(CATALOG_PATH, 'domains/Payment', 'schema.json'), 'SCHEMA!');

      await versionDomain('Payment');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'domains/Payment/versioned/0.0.1', 'index.md'))).toBe(true);
      expect(fs.existsSync(path.join(CATALOG_PATH, 'domains/Payment/versioned/0.0.1', 'schema.json'))).toBe(true);
      expect(fs.existsSync(path.join(CATALOG_PATH, 'domains/Payment', 'index.md'))).toBe(false);
      expect(fs.existsSync(path.join(CATALOG_PATH, 'domains/Payment', 'schema.json'))).toBe(false);
    });
  });

  describe('rmDomain', () => {
    it('removes a domain from eventcatalog by the given path', async () => {
      await writeDomain({
        id: 'Payment',
        name: 'Payment Domain',
        version: '0.0.1',
        summary: 'All things to do with the payment systems',
        markdown: '# Hello world',
      });

      expect(fs.existsSync(path.join(CATALOG_PATH, 'domains/Payment', 'index.md'))).toBe(true);

      await rmDomain('/Payment');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'domains/Payment', 'index.md'))).toBe(false);
    });
  });

  describe('rmDomainById', () => {
    it('removes a domain from eventcatalog by id', async () => {
      await writeDomain({
        id: 'Payment',
        name: 'Payment Domain',
        version: '0.0.1',
        summary: 'All things to do with the payment systems',
        markdown: '# Hello world',
      });

      expect(fs.existsSync(path.join(CATALOG_PATH, 'domains/Payment', 'index.md'))).toBe(true);

      await rmDomainById('Payment');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'domains/Payment', 'index.md'))).toBe(false);
    });

    it('removes a domain from eventcatalog by id and version', async () => {
      await writeDomain({
        id: 'Payment',
        name: 'Payment Domain',
        version: '0.0.1',
        summary: 'All things to do with the payment systems',
        markdown: '# Hello world',
      });

      expect(fs.existsSync(path.join(CATALOG_PATH, 'domains/Payment', 'index.md'))).toBe(true);

      await rmDomainById('Payment', '0.0.1');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'domains/Payment', 'index.md'))).toBe(false);
    });

    it('if version is given, only removes that version and not any other versions of the domain', async () => {
      // write the first events
      await writeDomain({
        id: 'Payment',
        name: 'Payment Domain',
        version: '0.0.1',
        summary: 'All things to do with the payment systems',
        markdown: '# Hello world',
      });

      await versionDomain('Payment');

      // Write the versioned event
      await writeDomain({
        id: 'Payment',
        name: 'Inventory Adjusted',
        version: '0.0.2',
        summary: 'This is a summary',
        markdown: '# Hello world',
      });

      expect(fs.existsSync(path.join(CATALOG_PATH, 'domains/Payment', 'index.md'))).toBe(true);
      expect(fs.existsSync(path.join(CATALOG_PATH, 'domains/Payment/versioned/0.0.1', 'index.md'))).toBe(true);

      await rmDomainById('Payment', '0.0.1');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'domains/Payment', 'index.md'))).toBe(true);

      expect(fs.existsSync(path.join(CATALOG_PATH, 'domains/InventoryAdjusted/versioned/0.0.2', 'index.md'))).toBe(false);
    });
  });

  describe('addFileToDomain', () => {
    it('takes a given file and writes it to the location of the given domain', async () => {
      const file = { content: 'hello', fileName: 'test.txt' };

      await writeDomain({
        id: 'Payment',
        name: 'Payment Domain',
        version: '0.0.1',
        summary: 'All things to do with the payment systems',
        markdown: '# Hello world',
      });

      await addFileToDomain('Payment', file);

      expect(fs.existsSync(path.join(CATALOG_PATH, 'domains/Payment', 'test.txt'))).toBe(true);
    });

    it('takes a given file and version and writes the file to the correct location', async () => {
      const file = { content: 'hello', fileName: 'test.txt' };

      await writeDomain({
        id: 'Payment',
        name: 'Payment Domain',
        version: '0.0.1',
        summary: 'All things to do with the payment systems',
        markdown: '# Hello world',
      });

      await versionDomain('Payment');

      await addFileToDomain('Payment', file, '0.0.1');

      expect(fs.existsSync(path.join(CATALOG_PATH, 'domains/Payment/versioned/0.0.1', 'test.txt'))).toBe(true);
    });

    it('throws an error when trying to write to a domain that does not exist', () => {
      const file = { content: 'hello', fileName: 'test.txt' };

      expect(addFileToDomain('Payment', file)).rejects.toThrowError('Cannot find directory to write file to');
    });
  });
});
