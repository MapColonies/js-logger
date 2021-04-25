import pino, { LoggerOptions as PinoOptions, Logger, destination } from 'pino';

type LoggerOptions = Pick<PinoOptions, 'enabled' | 'level' | 'prettyPrint' | 'redact' | 'hooks'>;

const baseOptions: PinoOptions = {
  formatters: {
    level(label): Record<string, string> {
      return { level: label };
    },
  },
};

const jsLogger = (options?: LoggerOptions, destination: string | number = 1): Logger => {
  const pinoOptions: PinoOptions = { ...baseOptions, ...options };
  return pino(pinoOptions, pino.destination(destination));
};

export { Logger } from 'pino';
export { LoggerOptions };
export default jsLogger;
