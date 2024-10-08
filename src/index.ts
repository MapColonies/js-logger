import pino, { LoggerOptions as PinoOptions, Logger, TransportSingleOptions } from 'pino';
import pinoCaller from 'pino-caller';

type LoggerOptions = Pick<PinoOptions, 'enabled' | 'level' | 'redact' | 'hooks' | 'base' | 'mixin'> & { prettyPrint?: boolean; pinoCaller?: boolean };

const baseOptions: PinoOptions = {
  formatters: {
    level(label): Record<string, string> {
      return { level: label };
    },
  },
};

const jsLogger = (options?: LoggerOptions, destination: string | number = 1): Logger => {
  let transport: TransportSingleOptions | undefined = undefined;

  /* istanbul ignore next */
  if (options?.prettyPrint === true) {
    transport = { target: 'pino-pretty' };

    delete options.prettyPrint;
  }

  const pinoOptions: PinoOptions = { ...baseOptions, ...options, transport };
  const logger = pino(pinoOptions, pino.destination(destination));

  if (options?.pinoCaller === true) {
    return pinoCaller(logger);
  }

  return logger;
};

export type { Logger } from 'pino';
export type { LoggerOptions };
export default jsLogger;
