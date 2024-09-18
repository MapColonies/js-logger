# js logger

Javascript and typescript logger for MapColonies based on pino.

## Usage

```typescript
import jsLogger from '@map-colonies/js-logger';

const logger = jsLogger();

logger.info('hello world');

logger.error({hello: 'world'});
```

for more detailed usage check the [pino documentation](https://github.com/pinojs/pino).

## Configuration
| name |type| default value | description
|---|---|---|---|
enabled | boolean | true| enables logging
level | string | 'info' | one of the supported level or silent to disable logging
prettyPrint | boolean |false| pretty print for developing purposes
redact | array | undefined| array of paths in object to be redacted from the log
destination | number / string | 1 | The stream to send the log to, or file
base | object | {pid: process.pid, hostname: os.hostname} | Key-value object added as child logger to each log line
pinoCaller | boolean | false | adds the call site of each log message to the log output 
