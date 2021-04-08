import jsLogger from '../src';

describe('plus', function () {
  it('should initialize the logger without errors', function () {
    const logger = jsLogger();

    expect(logger).toBeDefined();
    expect(() => logger.info('test')).not.toThrow();
  });
});
