import shortid from 'shortid';
import get from './get';

const set = async function ({store, client, table, key, val, generateKeyFn}) {
  client = client || store.client;
  generateKeyFn = generateKeyFn || shortid.generate;

  try {
    const {columnNames} = store.settings;

    key = key || generateKeyFn();

    const text = `
      INSERT INTO "${table}" ("${columnNames.key}", "${columnNames.val}", "${columnNames.createdAt}", "${columnNames.updatedAt}")
        VALUES ('${key}', $1, current_timestamp, current_timestamp);`;

    const values = [val];

    await client.query({text, values});

    return get({store, client, table, key});
  } catch (error) {
    return {
      error
    };
  }
};

export default set;
