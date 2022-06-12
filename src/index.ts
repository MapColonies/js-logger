import pino, { LoggerOptions as PinoOptions, Logger, TransportSingleOptions } from 'pino';

type LoggerOptions = Pick<PinoOptions, 'enabled' | 'level' | 'redact' | 'hooks' | 'base' | 'mixin'> & { prettyPrint?: boolean };

const baseOptions: PinoOptions = {
  formatters: {
    level(label): Record<string, string> {
      return { level: label };
    },
  },
};

const jsLogger = (options?: LoggerOptions, destination: string | number = 1): Logger => {
  let transport: TransportSingleOptions | undefined = undefined;

  if (options?.prettyPrint === true) {
    transport = { target: 'pino-pretty' };
  }

  const pinoOptions: PinoOptions = { ...baseOptions, ...options, transport };
  return pino(pinoOptions, pino.destination(destination));
};

export { Logger } from 'pino';
export { LoggerOptions };
export default jsLogger;
