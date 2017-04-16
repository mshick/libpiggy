import isObject from 'lodash/isObject';
import isNumber from 'lodash/isNumber';

const getQueryText = function ({table, key}) {
  let text;

  if (isObject(key)) {
    const keys = Object.keys(key);
    const wheres = keys.map(k => {
      const v = key[k];
      if (isNumber(v)) {
        return `(val ->> '${k}')::int = '${v}'`;
      }
      return `val ->> '${k}' = '${v}'`;
    });
    text = `SELECT * FROM ${table} WHERE ${wheres.join(' AND ')};`;
  } else {
    text = `SELECT * FROM ${table} WHERE key = '${key}';`;
  }

  return text;
};

const get = async function ({client, table, key}) {
  try {
    const text = getQueryText({table, key});
    const results = await client.query({text});
    const {val} = results.rows[0] ? results.rows[0] : {};

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

export default get;
