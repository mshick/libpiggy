import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import {applyToDefaults} from 'hoek';

const defaults = {
  indexType: 'gin',
  limit: 0
};

const getQueryTextBtree = function ({table, key}) {
  const keys = Object.keys(key);
  const wheres = keys.map(k => {
    const v = key[k];
    if (isNumber(v)) {
      return `(val ->> '${k}')::int = '${v}'`;
    }
    return `val ->> '${k}' = '${v}'`;
  });

  return `SELECT * FROM ${table} WHERE ${wheres.join(' AND ')}`;
};

const mget = async function ({client, table, key, options}) {
  const {indexType, limit} = applyToDefaults(defaults, options || {});

  try {
    let text;

    if (isString(key)) {
      text = `SELECT * FROM ${table} WHERE key = '${key}'`;
    } else if (indexType === 'btree') {
      text = getQueryTextBtree({table, key});
    } else {
      text = `SELECT * FROM ${table} WHERE val @> '${JSON.stringify(key)}'`;
    }

    if (limit > 0) {
      text += ` LIMIT ${limit};`;
    }

    const results = await client.query({text});
    const {rows} = results;

    return {
      client,
      results,
      rows
    };
  } catch (error) {
    return {
      client,
      error
    };
  }
};

export default mget;
