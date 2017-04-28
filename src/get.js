import mget from './mget';

const get = async function ({client, table, key, options}) {
  options = options || {};

  try {
    const got = await mget({
      client,
      table,
      key,
      options: {
        ...options,
        limit: 1
      }
    });

    if (got.error) {
      throw got.error;
    }

    const {results, rows} = got;

    if (rows && rows[0]) {
      return {
        client,
        results,
        key: rows[0].key,
        val: rows[0].val,
        createdAt: rows[0].created_at,
        updatedAt: rows[0].updated_at
      };
    }

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

export default get;
