/* eslint complexity:0 */
import isNumber from 'lodash/fp/isNumber';
import isString from 'lodash/fp/isString';
import isArray from 'lodash/fp/isArray';
import isObject from 'lodash/fp/isObject';
import isEmpty from 'lodash/fp/isEmpty';
import isUndefined from 'lodash/fp/isUndefined';
import defaultsDeep from 'lodash/fp/defaultsDeep';
import pickBy from 'lodash/fp/pickBy';
import map from 'lodash/fp/map';
import flow from 'lodash/fp/flow';
import createClient from './create-client';

const defaults = {
  operators: 'jsonb',
  limit: 0,
  offset: 0,
  orderBy: 'updatedAt',
  direction: 'desc',
  caseInsensitive: false
};

const compact = pickBy(x => !isUndefined(x));

const isEmptyObject = flow(
  compact,
  isEmpty
);

const convertToJson = (column, options = {}) => search => {
  const [key, val] = search;

  if (isNumber(val)) {
    return `("${column}" ->> '${key}')::int = ${val}`;
  }

  if (options.caseInsensitive) {
    return `lower("${column}" ->> '${key}') = lower('${val}')`;
  }

  return `"${column}" ->> '${key}' = '${val}'`;
};

const getQueryTextJson = ({key, not, columnNames, caseInsensitive}) => {
  const toJson = convertToJson(columnNames.val, {caseInsensitive});
  const search = key || not;

  if (isArray(search)) {
    const facets = map(obj => {
      const statements = map(toJson, Object.entries(obj));
      return `(${statements.join(' AND ')})`;
    }, search);
    return ` (${facets.join(' OR ')})`;
  }

  const statements = map(toJson, Object.entries(search));

  return ` (${statements.join(' AND ')})`;
};

const convertToJsonb = (column, options = {}) => search => {
  if (options.caseInsensitive) {
    return ` (lower("${column}"::text)::jsonb) @> (lower('${JSON.stringify(search)}')::jsonb)`;
  }

  return ` "${column}" @> '${JSON.stringify(search)}'`;
};

const getQueryTextJsonb = ({key, not, columnNames, caseInsensitive}) => {
  const toJsonb = convertToJsonb(columnNames.val, {caseInsensitive});
  const search = key || not;

  if (isArray(search)) {
    const wheres = map(toJsonb, search);
    return ` (${wheres.join(' OR ')})`;
  }

  return toJsonb(search);
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
  const {store, table, options} = params;
  let {key, not} = params;
  let {client} = params;

  let clientCreated = false;

  const settings = defaultsDeep(defaults, options);

  const {operators, limit, offset, orderBy, direction, caseInsensitive} = settings;
  const {columnNames} = store.settings;

  try {
    if (!client) {
      client = await createClient(options, globals);
      clientCreated = true;
    }

    if (isObject(key) && isEmptyObject(key)) {
      key = undefined;
    }

    if (isObject(not) && isEmptyObject(not)) {
      not = undefined;
    }

    if (isUndefined(key) && isUndefined(not)) {
      throw new Error('incomplete query, key or not params are required');
    }

    let text = `SELECT * FROM "${table}" WHERE`;

    if (!isUndefined(key)) {
      if (isString(key) || isNumber(key)) {
        text += ` "${columnNames.key}" LIKE '${key}'`;
      } else if (operators === 'json') {
        text += getQueryTextJson({
          key,
          columnNames,
          caseInsensitive
        });
      } else {
        text += getQueryTextJsonb({
          key,
          columnNames,
          caseInsensitive
        });
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
        text += getOrderByText({field: orderBy, direction, columnNames});
      } else {
        text += orderBy
          .map(o => {
            if (isArray(o)) {
              return getOrderByText({field: o[0], direction: o[1], columnNames});
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
