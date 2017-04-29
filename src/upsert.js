import shortid from 'shortid';
import defaultsDeep from 'lodash/defaultsDeep';
import get from './get';

const getQueryText = function ({table, key, existingKey}) {
  let text;

  if (existingKey) {
    text = `UPDATE ${table} SET (val, updated_at) = ($1, current_timestamp) WHERE key = '${key}';`;
  } else {
    text = `INSERT INTO ${table} (key, val, created_at, updated_at) VALUES ('${key}', $1, current_timestamp, current_timestamp);`;
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
  client,
  table,
  key,
  val: newVal,
  options,
  generateKeyFn
}) {
  try {
    const {merge} = options || {};

    generateKeyFn = generateKeyFn || shortid.generate;

    let got;

    if (key) {
      got = await get({client, table, key, options});
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

    const text = getQueryText({table, key, existingKey});
    const val = getVal({existingVal, newVal, merge});
    const values = [val];

    await client.query({text, values});

    return get({client, table, key, options});
  } catch (error) {
    return {
      client,
      error
    };
  }
};

export default upsert;
