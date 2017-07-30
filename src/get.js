import createClient from './create-client';
import mget from './mget';

const get = async function ({client, table, key, options, store}, globals) {
  options = options || {};

  let clientCreated = false;

  try {
    if (!client) {
      client = await createClient(options, globals);
      clientCreated = true;
    }

    const got = await mget({
      store,
      client,
      table,
      key,
      options: {
        ...options,
        limit: 1
      }
    });

    if (got.error) {
      throw got.error;
    }

    const {results, rows} = got;

    if (rows && rows[0]) {
      return {
        client,
        results,
        ...rows[0]
      };
    }

    return {
      client,
      results
    };
  } catch (error) {
    return {
      client,
      error
    };
  } finally {
    if (clientCreated) {
      client.close();
    }
  }
};

export default get;
