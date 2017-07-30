const tableExists = async function ({client, table, store}) {
  client = client || store.client;

  try {
    const text = `SELECT EXISTS (
      SELECT 1
      FROM   information_schema.tables
      WHERE  table_schema = 'public'
      AND    table_name = '${table}'
    );`;

    const results = await client.query({text});

    return {
      client,
      results,
      exists: results.rows[0].exists
    };
  } catch (error) {
    return {
      client,
      error
    };
  }
};

export default tableExists;
