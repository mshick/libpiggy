import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import defaultsDeep from 'lodash/defaultsDeep';

const defaults = {
  indexType: 'gin',
  limit: 0,
  offset: 0,
  orderBy: 'updated_at',
  direction: 'desc'
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
  const settings = defaultsDeep({}, options, defaults);

  const {indexType, limit, offset, orderBy, direction} = settings;

  try {
    let text;

    if (isString(key)) {
      text = `SELECT * FROM ${table} WHERE key LIKE '${key}'`;
    } else if (indexType === 'btree') {
      text = getQueryTextBtree({table, key});
    } else {
      text = `SELECT * FROM ${table} WHERE val @> '${JSON.stringify(key)}'`;
    }

    if (orderBy) {
      text += ` ORDER BY ${orderBy}`;
      if (direction) {
        text += ` ${direction}`;
      }
    }

    if (offset > 0) {
      text += ` OFFSET ${offset}`;
    }

    if (limit > 0) {
      text += ` LIMIT ${limit}`;
    }

    text += `;`;

    const results = await client.query({text});

    const rows = results.rows.map(r => ({
      key: r.key,
      val: r.val,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

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
