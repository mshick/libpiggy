import assert from 'assert';
import isArray from 'lodash/isArray';
import isNumber from 'lodash/isNumber';

const getQueryTextGin = function ({table, columnNames, options}) {
  const {operator} = options || {};

  let jsonPath = columnNames.val;

  if (operator === 'jsonb_path_ops') {
    jsonPath = `"${columnNames.val}" jsonb_path_ops`;
  }

  return `
    CREATE INDEX IF NOT EXISTS "${table}_gin"
      ON "${table}" USING gin (${jsonPath});
  `;
};

const getQueryTextBtree = function ({table, columnNames, options}) {
  const {fields} = options || {};

  if (fields && fields.length) {
    const indexText = fields.map(field => {
      if (field === 'key' || field === 'val') {
        assert.fail(false, `'key' and 'val' are not valid indexes`);
      }

      let jsonPath;

      const [fieldName, fieldType] = isArray(field) ? field : [field, 'text'];

      // E.g., foo.bar.baz[0] -> ['foo', 'bar', 'baz', 0]
      const fieldPartsRaw = fieldName.split(/[.|[]/).map(v => v.search(']') > -1 ? Number(v.replace(']', '')) : v);
      const indexName = fieldPartsRaw.join('_');

      // Quote the strings
      const fieldParts = fieldPartsRaw.map(p => isNumber(p) ? p : `'${p}'`);

      if (fieldType === 'object') {
        jsonPath = `("${columnNames.val}" -> ${fieldParts.join(' -> ')})`;
      }

      if (fieldType === 'text' || fieldType === 'integer') {
        const fieldLast = fieldParts.pop();
        if (fieldParts.length) {
          jsonPath = `("${columnNames.val}" -> ${fieldParts.join(' -> ')} ->> ${fieldLast})`;
        } else {
          jsonPath = `("${columnNames.val}" ->> ${fieldLast})`;
        }
      }

      if (fieldType === 'integer') {
        jsonPath = `(${jsonPath}::integer)`;
      }

      return `
        CREATE INDEX IF NOT EXISTS "${table}_${indexName}_btree"
          ON "${table}" (${jsonPath});
      `;
    });

    return indexText.join('');
  }

  return '';
};

const createIndexes = async function ({client, table, ginIndex, btreeIndex, columnNames}) {
  try {
    let text = '';

    if (ginIndex) {
      text += getQueryTextGin({table, columnNames, options: ginIndex});
    }

    if (btreeIndex) {
      text += getQueryTextBtree({table, columnNames, options: btreeIndex});
    }

    const results = await client.query({text});

    return {
      client,
      results
    };
  } catch (error) {
    return {
      client,
      error
    };
  }
};

export default createIndexes;
