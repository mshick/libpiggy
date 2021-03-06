const createTable = async function ({client, table, columns}) {
  try {
    const text = `
      CREATE TABLE IF NOT EXISTS "${table}" (${columns});
    `;

    const results = await client.query({text});

    return {
      client,
      results
    };
  } catch (error) {
    throw error;
  }
};

export default createTable;
