import { pino, LoggerOptions as PinoOptions, Logger, TransportSingleOptions, destination as pinoDestination } from 'pino';
import { pinoCaller } from 'pino-caller';

/**
 * Options for configuring the logger.
 */
interface LoggerOptions {
  /**
   * Determines if logging is enabled.
   */
  enabled?: PinoOptions['enabled'];
  /**
   * Specifies the logging level.
   */
  level?: PinoOptions['level'];
  /**
   * Defines paths to redact from log output.
   */
  redact?: PinoOptions['redact'];
  /**
   * Hooks for customizing log behavior.
   */
  hooks?: PinoOptions['hooks'];
  /**
   * Base properties to include in log output.
   */
  base?: PinoOptions['base'];
  /**
   * Function to add custom properties to log output.
   */
  mixin?: PinoOptions['mixin'];
  /**
   * Enables pretty-printing of log output.
   */
  prettyPrint?: boolean;
  /**
   * Includes the caller's file and line number in log output.
   */
  pinoCaller?: boolean;
}

const baseOptions: PinoOptions = {
  formatters: {
    level(label): Record<string, string> {
      return { level: label };
    },
  },
};

/**
 * Creates a logger instance with the specified options and destination.
 *
 * @param options - Optional configuration for the logger.
 * @param destination - The destination for the log output. Can be a file path or a file descriptor number. Default is 1.
 * @returns The configured logger instance.
 */
function jsLogger(options?: LoggerOptions, destination: string | number = 1): Logger {
  let transport: TransportSingleOptions | undefined = undefined;

  /* istanbul ignore next */
  if (options?.prettyPrint === true) {
    transport = { target: 'pino-pretty' };

    delete options.prettyPrint;
  }

  const pinoOptions: PinoOptions = { ...baseOptions, ...options, transport };
  const logger = pino(pinoOptions, pinoDestination(destination));

  if (options?.pinoCaller === true) {
    return pinoCaller(logger);
  }

  return logger;
}

export type { Logger } from 'pino';
export type { LoggerOptions };
export default jsLogger;
