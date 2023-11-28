import { readFileSync } from 'fs';
import { watch } from 'fs/promises';
import { setTimeout } from 'timers/promises';
import { Client } from '@elastic/elasticsearch';
import jsLogger from '../src';

async function waitForFileWrite(path: string): Promise<void> {
  const watcher = watch('.', { persistent: false });

  for await (const event of watcher) {
    if (event.filename === path && event.eventType === 'change') {
      return;
    }
  }
}

describe('jsLogger', function () {
  describe('basic', function () {
    it('should initialize the logger without errors', function () {
      const logger = jsLogger();

      expect(logger).toBeDefined();
      expect(() => logger.info('test')).not.toThrow();
    });

    it('should support other destinations', async function () {
      const path = 'avi.log';
      const logger = jsLogger({}, { file: { enabled: true, path: 'avi.log' }, console: { enabled: false } });

      const waitForFileWritePromise = waitForFileWrite(path);

      logger.info('avi');

      await waitForFileWritePromise;

      const logLine = JSON.parse(readFileSync(path).toString()) as Record<string, string>;

      expect(logLine).toHaveProperty('msg', 'avi');
    });

    it('should support base option', async function () {
      const path = 'avi-base.log';
      const logger = jsLogger({ base: { key: 'value' } }, { file: { enabled: true, path }, console: { enabled: false } });

      const waitForFileWritePromise = waitForFileWrite(path);

      logger.info('avi');

      await waitForFileWritePromise;

      const logLine = JSON.parse(readFileSync(path).toString()) as Record<string, string>;

      expect(logLine).toHaveProperty('msg', 'avi');
      expect(logLine).toHaveProperty('key', 'value');
    });

    it('should still initialize the logger with all destinations disabled', function () {
      const logger = jsLogger({}, { file: { enabled: false }, console: { enabled: false } });

      expect(logger).toBeDefined();
      expect(() => logger.info('test')).not.toThrow();
    });

    it('should initialize the elastic destination without errors', function () {
      const logger = jsLogger({}, { elastic: { enabled: true, debug: true, flushInterval: 1 } });

      expect(logger).toBeDefined();
      expect(() => logger.info('test')).not.toThrow();
    });
  });

  describe('elastic', function () {
    const index = 'test';
    const node = 'http://127.0.0.1:9200';

    const client = new Client({ node });

    async function esIsRunning() {
      return client
        .ping()
        .then(() => true)
        .catch(() => false);
    }

    async function esWaitCluster() {
      const ATTEMPTS_LIMIT = 10;

      for (let i = 0; i <= ATTEMPTS_LIMIT; i += 1) {
        try {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          await client.cluster.health({ wait_for_status: 'green', timeout: '60s' });
        } catch (error) {
          if (i === ATTEMPTS_LIMIT) {
            throw error;
          }
        }
      }
    }

    beforeEach(async function () {
      if (!(await esIsRunning())) {
        await esWaitCluster();
      }

      await client.indices.delete({ index }, { ignore: [404] });
      // eslint-disable-next-line @typescript-eslint/naming-convention
      await client.indices.create({ index });
    });

    afterAll(async function () {
      await client.close();
    });

    it('should push logs to elastic', async function () {
      const logger = jsLogger(
        {},
        {
          elastic: {
            enabled: true,
            node,
            index,
            flushInterval: 50,
          },
        }
      );

      logger.info('avi');

      // waiting for elastic index flush
      await setTimeout(1000);

      // eslint-disable-next-line @typescript-eslint/naming-convention
      const res = await client.search({ index, query: { match_all: {} } });
      expect(res.hits.total).toHaveProperty('value', 1);
      expect(res.hits.hits[0]._source).toHaveProperty('msg', 'avi');
    });
  });
});
