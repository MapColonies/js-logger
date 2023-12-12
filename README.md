# js logger

Javascript and typescript logger for MapColonies based on pino.
The logger supports three possible destinations for the logs:
- console
- file
- elasticsearch

## Installation
```sh
npm install @map-colonies/js-logger
```

## Usage
### Basic Usage
```typescript
import jsLogger from '@map-colonies/js-logger';

const logger = jsLogger();

logger.info('hello world');

logger.error({hello: 'world'});
```

### Pretty Print
```typescript
import jsLogger from '@map-colonies/js-logger';

const logger = jsLogger({}, { console: { enabled: true, prettyPrint: true } });

logger.info('test');
```

### File destination
```typescript
import jsLogger from '@map-colonies/js-logger';

const logger = jsLogger({}, { console: { enabled: false }, file: { enabled: true, path: 'logs/app.log' } });

logger.info('test');
```

### Elasticsearch destination
```typescript
const logger = jsLogger({}, { console: { enabled: false }, elastic: { enabled: true, node: 'http://localhost:9200' } });

logger.info('test');
```



for more detailed usage check the [pino documentation](https://github.com/pinojs/pino).

## Configuration
### Base
| name |type| default value | description
|---|---|---|---|
enabled | boolean | true| enables logging
level | string | 'info' | one of the supported level or silent to disable logging
prettyPrint | boolean |false| pretty print for developing purposes
redact | array | undefined| array of paths in object to be redacted from the log
base | object | {pid: process.pid, hostname: os.hostname} | Key-value object added as child logger to each log line

### Destinations
| name |type| default value | description | env
|---|---|---|---|---|
console.enabled | boolean | true | Whether to enable the console destination | LOGGER_CONSOLE_ENABLED
console.prettyPrint | string | false | Pretty print the logs the console | LOGGER_CONSOLE_PRETTY_PRINT
console.destination | 'stdout' or 'stderr' | 'stdout' | The destination to use for the console logs | LOGGER_CONSOLE_DESTINATION
elastic.enabled | boolean | false | Whether to enable the elastic destination | LOGGER_ELASTIC_ENABLED
elastic.index | string | | The index to use for the logs | LOGGER_ELASTIC_INDEX
elastic.node | string | http://localhost:9200 | The node to connect to | LOGGER_ELASTIC_NODE
elastic.auth.username | string | | The username to use for authentication | LOGGER_ELASTIC_AUTH_USERNAME
elastic.auth.password | string | | The password to use for authentication | LOGGER_ELASTIC_AUTH_PASSWORD
elastic.auth.apiKey | string | | The api key to use for authentication | LOGGER_ELASTIC_AUTH_API_KEY
elastic.esVersion | number | 7 | The elasticsearch version to use | LOGGER_ELASTIC_ES_VERSION
elastic.flushInterval | number | 30000 | The interval to use for flushing the logs to the cluster | LOGGER_ELASTIC_FLUSH_INTERVAL
elastic.rejectUnauthorized | boolean | true | Whether to reject unauthorized connections | LOGGER_ELASTIC_REJECT_UNAUTHORIZED
elastic.type | string | | The type to use for the logs | LOGGER_ELASTIC_TYPE
elastic.debug | string | false | Whether to enable debug mode | LOGGER_ELASTIC_DEBUG
file.enabled | boolean | false | Whether to enable the file destination | - |
file.path | string | | The file path to use for the logs  | - |

## Running tests
Make sure you have a running elastic cluster. You can run a local cluster using the following docker command:
```sh
docker run -d --name elasticsearch -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -e ES_JAVA_OPTS="-Xms750m -Xmx750m" --env "xpack.security.enabled=false" elasticsearch:8.11.1
```

To run the test use the following command:
```
npm run test
```
