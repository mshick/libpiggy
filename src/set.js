import buildStoreSetQuery from './build-store-set-query';

const set = async function ({client, table, key, val}) {
  try {
    const q = buildStoreSetQuery({key, value: val, table});
    const results = await client.query(q);

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

export default set;
