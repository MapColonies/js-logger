import { readFileSync } from 'fs';
import jsLogger from '../src';

describe('jsLogger', function () {
  it('should initialize the logger without errors', function () {
    const logger = jsLogger();

    expect(logger).toBeDefined();
    expect(() => logger.info('test')).not.toThrow();
  });

  it('should support other destinations', function () {
    const logger = jsLogger({}, 'avi.log');

    logger.info('avi');

    const logLine = JSON.parse(readFileSync('avi.log').toString()) as Record<string, string>;

    expect(logLine).toHaveProperty('msg', 'avi');
  });

  it('should support base option', function () {
    const logger = jsLogger({ base: { key: 'value' } }, 'avi-base.log');

    logger.info('avi');

    const logLine = JSON.parse(readFileSync('avi-base.log').toString()) as Record<string, string>;

    expect(logLine).toHaveProperty('msg', 'avi');
  });
});
