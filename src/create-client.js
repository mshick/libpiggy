import defaultsDeep from 'lodash/defaultsDeep';

const createClient = async function (options, globals) {
  try {
    const settings = defaultsDeep({}, options, globals.options);

    const {openPools, openClients} = globals.state;
    const pool = openPools[settings.connectionName];

    const client = await pool.connect();

    client.close = () => {
      const clientIndex = openClients.indexOf(client);
      if (clientIndex > -1) {
        openClients.splice(clientIndex, 1);
      }
      client.release();
    };

    openClients.push(client);

    return client;
  } catch (error) {
    throw error;
  }
};

export default createClient;
