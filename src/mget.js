import isNumber from 'lodash/fp/isNumber';
import isString from 'lodash/fp/isString';
import isArray from 'lodash/fp/isArray';
import isUndefined from 'lodash/fp/isUndefined';
import defaultsDeep from 'lodash/fp/defaultsDeep';
import createClient from './create-client';

const defaults = {
  operators: 'jsonb',
  limit: 0,
  offset: 0,
  orderBy: 'updatedAt',
  direction: 'desc',
  caseInsensitive: false
};

const getQueryTextJson = function ({key, not, columnNames, caseInsensitive}) {
  const keys = Object.keys(key || not);

  const wheres = keys.map(k => {
    const v = key[k];
    if (isNumber(v)) {
      return `("${columnNames.val}" ->> '${k}')::int = '${v}'`;
    }

    if (caseInsensitive) {
      return `lower("${columnNames.val}" ->> '${k}') = lower('${v}')`;
    }

    return `"${columnNames.val}" ->> '${k}' = '${v}'`;
  });

  if (not) {
    return ` ${wheres.join(' AND NOT ')}`;
  }

  return ` ${wheres.join(' AND ')}`;
};

const getQueryTextJsonb = function ({key, not, columnNames, caseInsensitive}) {
  key = key || not;

  let text = '';

  if (caseInsensitive) {
    text += ` (lower("${columnNames.val}"::text)::jsonb) @> (lower('${JSON.stringify(key)}')::jsonb)`;
  } else {
    text += ` "${columnNames.val}" @> '${JSON.stringify(key)}'`;
  }

  return text;
};

const getOrderByText = function ({columnNames, field, direction}) {
  let text = '';

  if (columnNames[field]) {
    text += `"${columnNames[field]}"`;
  } else {
    text += `"${columnNames.val}" ->> '${field}'`;
  }

  if (direction) {
    text += ` ${direction.toUpperCase()}`;
  }

  return text;
};

const mget = async function (params, globals) {
  const {store, table, key, not, options} = params;
  let {client} = params;

  let clientCreated = false;

  const settings = defaultsDeep(defaults, options);

  const {operators, limit, offset, orderBy, sort, direction, caseInsensitive} = settings;
  const {columnNames} = store.settings;

  try {
    if (!client) {
      client = await createClient(options, globals);
      clientCreated = true;
    }

    let text = `SELECT * FROM "${table}" WHERE`;

    if (!isUndefined(key)) {
      if (isString(key) || isNumber(key)) {
        text += ` "${columnNames.key}" LIKE '${key}'`;
      } else if (operators === 'json') {
        text += getQueryTextJson({key, columnNames, caseInsensitive});
      } else {
        text += getQueryTextJsonb({key, columnNames, caseInsensitive});
      }
    }

    if (!isUndefined(not)) {
      if (!isUndefined(key)) {
        text += ` AND`;
      }

      if (isString(not) || isNumber(not)) {
        text += ` "${columnNames.key}" NOT LIKE '${not}'`;
      } else if (operators === 'json') {
        text += ` NOT`;
        text += getQueryTextJson({not, columnNames, caseInsensitive});
      } else {
        text += ` NOT`;
        text += getQueryTextJsonb({not, columnNames, caseInsensitive});
      }
    }

    if (orderBy) {
      text += ` ORDER BY `;

      if (isString(orderBy)) {
        text += getOrderByText({field: orderBy, direction: direction || sort, columnNames});
      } else {
        text += orderBy
          .map(o => {
            if (isArray(o)) {
              return getOrderByText({field: o[0], direction: o[1], columnNames});
            }

            if (o.sort) {
              return getOrderByText({field: o.field, direction: o.sort, columnNames});
            }

            return getOrderByText({...o, columnNames});
          })
          .join(', ');
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
      table,
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
    throw error;
  } finally {
    if (clientCreated) {
      client.close();
    }
  }
};

export default mget;
