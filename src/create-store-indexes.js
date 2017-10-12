import assert from 'assert';
import isNumber from 'lodash/isNumber';
import map from 'lodash/fp/map';

const getFieldParts = function (fieldName) {
  // E.g., foo.bar.baz[0] -> ['foo', 'bar', 'baz', 0]
  return fieldName.split(/[.|[]/).map(v => v.search(']') > -1 ? Number(v.replace(']', '')) : v);
};

const getIndexPath = function (field) {
  const fieldParts = getFieldParts(field);
  return fieldParts.join('_');
};

const getJsonPath = function (field, type, columnNames) {
  // Quote the strings
  const fieldPartsRaw = getFieldParts(field);
  const fieldParts = fieldPartsRaw.map(p => isNumber(p) ? p : `'${p}'`);

  let jsonPath;

  if (type === 'object') {
    jsonPath = `("${columnNames.val}" -> ${fieldParts.join(' -> ')})`;
  }

  if (type === 'text' || type === 'integer') {
    const fieldLast = fieldParts.pop();

    if (fieldParts.length) {
      jsonPath = `("${columnNames.val}" -> ${fieldParts.join(' -> ')} ->> ${fieldLast})`;
    } else {
      jsonPath = `("${columnNames.val}" ->> ${fieldLast})`;
    }
  }

  if (type === 'integer') {
    jsonPath = `(${jsonPath}::integer)`;
  }

  return jsonPath;
};

const getIndexesQueryText = function ({table, columnNames, indexes}) {
  const text = map(index => {
    const {field, type, unique, lower} = index;

    if (field === 'key' || field === 'val') {
      assert.fail(false, `'key' and 'val' are not valid indexes`);
    }

    const indexPath = getIndexPath(field);

    let jsonPath = getJsonPath(field, type, columnNames);

    if (lower) {
      jsonPath = `lower(${jsonPath})`;
    }

    const indexName = `${table}_${columnNames.val}_${indexPath}_idx`;

    return `
      CREATE ${unique ? 'UNIQUE' : ''} INDEX IF NOT EXISTS "${indexName}"
        ON "${table}" (${jsonPath});
    `;
  }, indexes);

  return text.join('');
};

const createIndexes = async function (options = {}) {
  const {client, table, indexes, columnNames} = options;

  try {
    // The primary gin index with jsonb_path_ops
    let text = `
      CREATE INDEX IF NOT EXISTS "${table}_${columnNames.val}_idx"
        ON "${table}" USING gin ("${columnNames.val}" jsonb_path_ops);
    `;

    // Secondary indexes
    if (indexes && indexes.length) {
      text += getIndexesQueryText({table, columnNames, indexes});
    }

    const results = await client.query({text});

    return {
      client,
      results
    };
  } catch (error) {
    throw error;
  }
};

export default createIndexes;
