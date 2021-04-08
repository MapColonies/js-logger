import pino, { LoggerOptions as PinoOptions, Logger } from 'pino';
export { Logger } from 'pino';

export type LoggerOptions = Pick<PinoOptions, 'enabled' | 'level' | 'prettyPrint' | 'redact'>;

const baseOptions: PinoOptions = { useLevelLabels: true };

const jsLogger = (options?: LoggerOptions): Logger => {
  const pinoOptions: PinoOptions = { ...baseOptions, ...options };
  return pino(pinoOptions);
};

export default jsLogger;
