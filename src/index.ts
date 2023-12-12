import pino, { LoggerOptions as PinoOptions, Logger, DestinationStream } from 'pino';
import pretty from 'pino-pretty';
import { multistream } from 'pino-multi-stream';
import pinoElastic from 'pino-elasticsearch';
import { z } from 'zod';
import deepmerge from 'deepmerge';

const DEFAULT_ES_VERSION = 7;
const stdDestinations = {
  stdout: 1,
  stderr: 2,
};

type LoggerOptions = Pick<PinoOptions, 'enabled' | 'level' | 'redact' | 'hooks' | 'base' | 'mixin'>;

const elasticOptionsSchema = z.object({
  /** Whether to enable the elastic destination. */
  enabled: z.boolean().default(false),
  /** The index to use for the logs. */
  index: z.string().optional(),
  /** The node to connect to. The default value is http://localhost:9200. */
  node: z.string().url().default('http://localhost:9200'),
  /** The elasticsearch version to use. The default value is 7. */
  esVersion: z.number().default(DEFAULT_ES_VERSION),
  /** The authentication to use. */
  auth: z
    .union([
      z.object({
        /** The username to use for authentication. */
        username: z.string(),
        /** The password to use for authentication. */
        password: z.string(),
      }),
      z.object({
        /** The api key to use for authentication. */
        apiKey: z.string(),
      }),
    ])
    .optional(),
  /** The interval to use for flushing the logs. */
  flushInterval: z.number().gt(0).optional(),
  /** Whether to reject unauthorized connections. */
  rejectUnauthorized: z.boolean().optional(),
  /** The type to use for the logs. */
  type: z.string().optional(),
  /** Whether to enable debug mode. */
  debug: z.boolean().optional(),
});

const consoleOptionsSchema = z.object({
  /** Whether to enable the console destination. */
  enabled: z.boolean().default(true),
  /** Whether to use pretty print for the console logs. */
  prettyPrint: z.boolean().default(false),
  /** The destination to use for the console logs. */
  destination: z.union([z.literal('stdout'), z.literal('stderr')]).default('stdout'),
});

const fileOptionsSchema = z.object({
  /** Whether to enable the file destination. */
  enabled: z.boolean().default(false),
  /** The file path to use for the logs. */
  path: z.string().default('logs/app.log'),
});

const destinationOptionsSchema = z.object({
  /** The options for the elastic destination. */
  elastic: elasticOptionsSchema.default({}),
  /** The options for the console destination. */
  console: consoleOptionsSchema.default({}),
  /** The options for the file destination. */
  file: fileOptionsSchema.default({}),
});

type DestinationOptions = z.input<typeof destinationOptionsSchema>;

const baseOptions: PinoOptions = {
  formatters: {
    level(label): Record<string, string> {
      return { level: label };
    },
  },
};

const validateDestinationOptions = (options?: DestinationOptions): z.output<typeof destinationOptionsSchema> => {
  let auth = undefined;
  if (
    [process.env.LOGGER_ELASTIC_AUTH_USERNAME, process.env.LOGGER_ELASTIC_AUTH_PASSWORD, process.env.LOGGER_ELASTIC_AUTH_API_KEY].some(
      (v) => v !== undefined
    )
  ) {
    auth = {
      username: process.env.LOGGER_ELASTIC_AUTH_USERNAME,
      password: process.env.LOGGER_ELASTIC_AUTH_PASSWORD,
      apiKey: process.env.LOGGER_ELASTIC_AUTH_API_KEY,
    };
  }
  const envDestinationOptions = {
    elastic: {
      enabled: process.env.LOGGER_ELASTIC_ENABLED,
      index: process.env.LOGGER_ELASTIC_INDEX,
      node: process.env.LOGGER_ELASTIC_NODE,
      esVersion: process.env.LOGGER_ELASTIC_ES_VERSION,
      auth,
      flushInterval: process.env.LOGGER_ELASTIC_FLUSH_INTERVAL,
      rejectUnauthorized: process.env.LOGGER_ELASTIC_REJECT_UNAUTHORIZED,
      type: process.env.LOGGER_ELASTIC_TYPE,
      debug: process.env.LOGGER_ELASTIC_DEBUG,
    },
    console: {
      enabled: process.env.LOGGER_CONSOLE_ENABLED,
      prettyPrint: process.env.LOGGER_CONSOLE_PRETTY_PRINT,
      destination: process.env.LOGGER_CONSOLE_DESTINATION,
    },
  };
  return destinationOptionsSchema.parse(deepmerge(envDestinationOptions, options ?? {}));
};

/**
 * Initialize a logger with the given options.
 * @param options The pino options to use for the logger.
 * @param destinationOptions The destination options to use for the logger.
 * @returns A pino logger.
 */
function jsLogger(options?: LoggerOptions, destinationOptions?: DestinationOptions): Logger {
  const streams: DestinationStream[] = [];

  const validatedOptions = validateDestinationOptions(destinationOptions);

  if (validatedOptions.console.enabled) {
    const { prettyPrint, destination } = validatedOptions.console;
    const stream = prettyPrint ? pretty() : pino.destination(stdDestinations[destination]);
    streams.push(stream);
  }

  if (validatedOptions.elastic.enabled) {
    const { enabled, debug, ...elasticOptions } = validatedOptions.elastic;

    const stream = pinoElastic(elasticOptions);

    if (debug === true) {
      stream.on('error', console.error);
      stream.on('insertError', console.error);
      stream.on('unknown', console.error);
    }
    streams.push(stream);
  }

  if (validatedOptions.file.enabled) {
    const { path } = validatedOptions.file;
    const stream = pino.destination(path);
    streams.push(stream);
  }

  let noDestinationSelected = false;
  if (streams.length === 0) {
    noDestinationSelected = true;
    streams.push(pino.destination(stdDestinations['stdout']));
  }

  const pinoOptions: PinoOptions = { ...baseOptions, ...options };
  const logger = pino(pinoOptions, multistream(streams.map((stream) => ({ stream }))));
  if (noDestinationSelected) {
    logger.warn('No destination selected, logging to stdout');
  }
  return logger;
}

export type { Logger } from 'pino';
export { LoggerOptions, DestinationOptions };
export default jsLogger;
