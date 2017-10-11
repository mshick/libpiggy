import defaultsDeep from 'lodash/defaultsDeep';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import createClient from './create-client';
import get from './get';
import set from './set';

const getText = function ({table, existingKey, columnNames}) {
  return `UPDATE "${table}" SET ("${columnNames.val}", "${columnNames.updatedAt}") = ($1, current_timestamp) WHERE "${columnNames.key}" = '${existingKey}';`;
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
  not,
  val: newVal,
  options,
  generateKeyFn
}, globals) {
  let clientCreated = false;

  try {
    if (!client) {
      client = await createClient(options, globals);
      clientCreated = true;
    }

    const {columnNames} = store.settings;
    const {merge} = options || {};

    let existing;

    if (key) {
      existing = await get({store, client, table, key, not, options});
    }

    if (!existing || !existing.key) {
      let newKey;

      if (isString(key) || isNumber(key)) {
        newKey = key;
      }

      return set({
        store,
        client,
        table,
        key: newKey,
        val: newVal,
        options,
        generateKeyFn
      });
    }

    const existingKey = existing.key;
    const existingVal = existing.val;
    const text = getText({table, existingKey, columnNames});
    const val = getVal({existingVal, newVal, merge});
    const values = [val];

    await client.query({text, values});

    return get({
      store,
      client,
      table,
      key: existingKey,
      options
    });
  } catch (error) {
    throw error;
  } finally {
    if (clientCreated && client) {
      client.close();
    }
  }
};

export default upsert;
