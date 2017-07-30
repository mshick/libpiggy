import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import defaultsDeep from 'lodash/defaultsDeep';

const defaults = {
  indexType: 'gin',
  limit: 0,
  offset: 0,
  orderBy: 'updatedAt',
  direction: 'desc'
};

const getQueryTextBtree = function ({table, key, columnNames}) {
  const keys = Object.keys(key);
  const wheres = keys.map(k => {
    const v = key[k];
    if (isNumber(v)) {
      return `("${columnNames.val}" ->> '${k}')::int = '${v}'`;
    }
    return `"${columnNames.val}" ->> '${k}' = '${v}'`;
  });

  return `SELECT * FROM "${table}" WHERE ${wheres.join(' AND ')}`;
};

const mget = async function ({store, client, table, key, options}) {
  client = client || store.client;

  const settings = defaultsDeep({}, options, defaults);

  const {indexType, limit, offset, orderBy, direction} = settings;
  const {columnNames} = store.settings;

  try {
    let text;

    if (isString(key) || isNumber(key)) {
      text = `SELECT * FROM "${table}" WHERE "${columnNames.key}" LIKE '${key}'`;
    } else if (indexType === 'btree') {
      text = getQueryTextBtree({table, key, columnNames});
    } else {
      text = `SELECT * FROM "${table}" WHERE "${columnNames.val}" @> '${JSON.stringify(key)}'`;
    }

    if (orderBy) {
      if (columnNames[orderBy]) {
        text += ` ORDER BY "${columnNames[orderBy]}"`;
      } else {
        text += ` ORDER BY "${orderBy}"`;
      }
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
      createdAt: r[columnNames.createdAt],
      updatedAt: r[columnNames.updatedAt]
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
