import find from './find';

const get = async function ({client, table, key, options}) {
  options = options || {};

  try {
    const found = await find({
      client,
      table,
      key,
      options: {
        ...options,
        limit: 1
      }
    });

    if (found.error) {
      throw found.error;
    }

    const {results, rows} = found;

    let foundKey;
    let foundVal;

    if (rows && rows[0]) {
      foundKey = rows[0].key;
      foundVal = rows[0].val;
    }

    return {
      client,
      results,
      key: foundKey,
      val: foundVal
    };
  } catch (error) {
    return {
      client,
      error
    };
  }
};

export default get;
