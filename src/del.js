const del = async function ({client, table, key}) {
  try {
    const text = `DELETE FROM "${table}" WHERE "key" = $1;`;
    const values = [key];
    const results = await client.query({text, values});

    return {
      client,
      results,
      key
    };
  } catch (error) {
    return {
      client,
      error
    };
  }
};

export default del;
