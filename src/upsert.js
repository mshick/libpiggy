import shortid from 'shortid';
import defaultsDeep from 'lodash/defaultsDeep';
import get from './get';

const getQueryText = function ({table, key, existingKey, columnNames}) {
  let text;

  if (existingKey) {
    text = `UPDATE "${table}" SET ("${columnNames.val}", "${columnNames.updatedAt}") = ($1, current_timestamp) WHERE "${columnNames.key}" = '${key}';`;
  } else {
    text = `INSERT INTO "${table}" ("${columnNames.key}", "${columnNames.val}", "${columnNames.createdAt}", "${columnNames.updatedAt}") VALUES ('${key}', $1, current_timestamp, current_timestamp);`;
  }

  return text;
};

const getVal = function ({existingVal, newVal, merge}) {
  let val = {};

  if (merge && existingVal) {
    val = defaultsDeep({}, newVal, existingVal);
  } else {
    val = newVal;
  }

  return val;
};

const upsert = async function ({
  store,
  client,
  table,
  key,
  val: newVal,
  options,
  generateKeyFn
}) {
  client = client || store.client;

  try {
    const {merge} = options || {};

    generateKeyFn = generateKeyFn || shortid.generate;

    let got;

    if (key) {
      got = await get({store, client, table, key, options});
    }

    let existingKey;
    let existingVal;

    if (got) {
      existingKey = got.key;
      existingVal = got.val;
      key = existingKey;
    }

    if (!key || typeof key !== 'string') {
      key = generateKeyFn();
    }

    const {columnNames} = store.settings;
    const text = getQueryText({table, key, existingKey, columnNames});
    const val = getVal({existingVal, newVal, merge});
    const values = [val];

    await client.query({text, values});

    return get({store, client, table, key, options});
  } catch (error) {
    return {
      client,
      error
    };
  }
};

export default upsert;
