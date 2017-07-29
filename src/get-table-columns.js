const getTableColumns = async function ({client, table}) {
  try {
    const text = `
      SELECT *
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name   = "${table}"
    `;

    const results = await client.query({text});

    return {
      client,
      results,
      columns: results.rows
    };
  } catch (error) {
    return {
      client,
      error
    };
  }
};

export default getTableColumns;
