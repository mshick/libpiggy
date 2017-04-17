import url from 'url';
import {applyToDefaults} from 'hoek';

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

const createConnection = async function (options, globals) {
  try {
    const settings = applyToDefaults(globals.options, options || {});

    const {
      url: connectionUrl,
      connectionName,
      connection: connectionConfig
    } = settings;

    const {openPools, openClients} = globals.state;

    if (!openPools[connectionName]) {
      const urlConfig = urlToConfig(connectionUrl);
      const config = applyToDefaults(urlConfig, connectionConfig);
      openPools[connectionName] = new pg.Pool(config);
    }

    const client = await openPools[connectionName].connect();

    openClients.push(client);

    client.close = () => {
      const clientIndex = openClients.indexOf(client);
      if (clientIndex > -1) {
        openClients.splice(clientIndex, 1);
      }
      client.release();
    };

    return client;
  } catch (error) {
    throw error;
  }
};

export default createConnection;
