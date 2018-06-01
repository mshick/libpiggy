import {defaultsDeep} from 'lodash/fp';
import pgConnectionString from 'pg-connection-string';

let pg;

try {
  require('pg-native');
  pg = require('pg').native;
} catch (e) {
  pg = require('pg');
}

const createPool = async function (options, globals) {
  try {
    const {
      url: connectionUrl,
      connectionName,
      connection: connectionOptions
    } = options;

    const {openPools} = globals.state;

    if (!openPools[connectionName]) {
      const urlConfig = pgConnectionString.parse(connectionUrl);
      const poolConfig = defaultsDeep(urlConfig, connectionOptions);
      openPools[connectionName] = new pg.Pool(poolConfig);
    }

    return openPools[connectionName];
  } catch (error) {
    throw error;
  }
};

export default createPool;
