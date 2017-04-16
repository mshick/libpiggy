import shortid from 'shortid';
import {applyToDefaults} from 'hoek';
import get from './get';

const getQueryText = function ({table, key, existingKey}) {
  let text;

  if (existingKey) {
    text = `UPDATE ${table} SET (val) = ($1) WHERE key = '${key}';`;
  } else {
    text = `INSERT INTO ${table} (key, val) VALUES ('${key}', $1);`;
  }

  return text;
};

const getVal = function ({existingVal, newVal, merge}) {
  let val = {};

  if (merge && existingVal) {
    val = applyToDefaults(existingVal, newVal, true);
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

    const got = await key && get({client, table, key});

    let existingKey;
    let existingVal;

    if (got) {
      existingKey = got.key;
      existingVal = got.val;
    }

    key = existingKey || key;

    if (!key || typeof key !== 'string') {
      key = generateKeyFn();
    }

    const text = getQueryText({table, key, existingKey});
    const val = getVal({existingVal, newVal, merge});
    const values = [val];
    const results = await client.query({text, values});

    return {
      client,
      results,
      key,
      val
    };
  } catch (error) {
    return {
      client,
      error
    };
  }
};

export default upsert;
