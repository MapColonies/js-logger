import pino, { LoggerOptions as PinoOptions, Logger } from 'pino';

type LoggerOptions = Pick<PinoOptions, 'enabled' | 'level' | 'prettyPrint' | 'redact' | 'hooks'>;

const baseOptions: PinoOptions = { useLevelLabels: true };

const jsLogger = (options?: LoggerOptions): Logger => {
  const pinoOptions: PinoOptions = { ...baseOptions, ...options };
  return pino(pinoOptions);
};

export { Logger } from 'pino';
export { LoggerOptions };
export default jsLogger;
