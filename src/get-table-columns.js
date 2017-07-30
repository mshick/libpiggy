import createClient from './create-client';

const getTableColumns = async function ({client, table, options}, globals) {
  let clientCreated = false;

  try {
    if (!client) {
      client = await createClient(options, globals);
      clientCreated = true;
    }

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
  } finally {
    if (clientCreated) {
      client.close();
    }
  }
};

export default getTableColumns;
