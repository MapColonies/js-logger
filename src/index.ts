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

  if (options?.prettyPrint === true) {
    transport = { target: 'pino-pretty' };

    delete options.prettyPrint;
  }

  const pinoOptions: PinoOptions = { ...baseOptions, ...options, transport };
  const logger = pino(pinoOptions, pino.destination(destination));
  const loggerWithCaller = pinoCaller(logger);
  return options?.pinoCaller === true ? loggerWithCaller : logger;
};

export { Logger } from 'pino';
export { LoggerOptions };
export default jsLogger;
