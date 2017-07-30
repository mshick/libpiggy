import url from 'url';
import defaultsDeep from 'lodash/defaultsDeep';

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
    const settings = defaultsDeep({}, options, globals.options);

    const {
      url: connectionUrl,
      connectionName,
      connection: connectionOptions
    } = settings;

    const {openPools} = globals.state;

    if (!openPools[connectionName]) {
      const urlConfig = urlToConfig(connectionUrl);
      const poolConfig = defaultsDeep({}, connectionOptions, urlConfig);
      openPools[connectionName] = new pg.Pool(poolConfig);
    }

    return openPools[connectionName];
  } catch (error) {
    throw error;
  }
};

export default createPool;
