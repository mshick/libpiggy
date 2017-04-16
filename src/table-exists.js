const tableExists = async function ({client, table}) {
  try {
    const text = `SELECT to_regclass('${table}');`;
    const results = await client.query({text});

    return {
      client,
      results,
      exists: Boolean(results.rows[0].to_regclass)
    };
  } catch (error) {
    return {
      client,
      error
    };
  }
};

export default tableExists;
