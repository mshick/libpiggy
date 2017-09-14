import shortid from 'shortid';
import isUndefined from 'lodash/isUndefined';
import createClient from './create-client';
import get from './get';

const set = async function ({store, client, table, key, val, options, generateKeyFn}, globals) {
  generateKeyFn = generateKeyFn || shortid.generate;

  let clientCreated = false;

  try {
    if (!client) {
      client = await createClient(options, globals);
      clientCreated = true;
    }

    const {columnNames} = store.settings;

    key = isUndefined(key) ? generateKeyFn() : key;

    const text = `
      INSERT INTO "${table}" ("${columnNames.key}", "${columnNames.val}", "${columnNames.createdAt}", "${columnNames.updatedAt}")
        VALUES ('${key}', $1, current_timestamp, current_timestamp);`;

    const values = [val];

    await client.query({text, values});

    return get({
      store,
      client,
      table,
      key
    });
  } catch (error) {
    throw error;
  } finally {
    if (clientCreated) {
      client.close();
    }
  }
};

export default set;
