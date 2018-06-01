import url from 'url';
import {defaultsDeep} from 'lodash/fp';
import pgConnectionString from 'pg-connection-string';

let pg;

try {
  require('pg-native');
  pg = require('pg').native;
} catch (e) {
  pg = require('pg');
}

const urlToConfig = function (connectionUrl) {
  const {hostname: host, port, pathname, auth} = url.parse(connectionUrl);
  const [user, password] = auth ? auth.split(':') : [];
  const [, database] = pathname ? pathname.split('/') : [];

  return {
    user,
    password,
    host,
    port,
    database
  };
};

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
