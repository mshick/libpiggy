import createClient from './create-client';

const del = async function ({client, table, key, store, options}, globals) {
  let clientCreated = false;

  try {
    if (!client) {
      client = await createClient(options, globals);
      clientCreated = true;
    }

    const {columnNames} = store.settings;
    const text = `DELETE FROM "${table}" WHERE "${columnNames.key}" = $1;`;
    const values = [key];
    const results = await client.query({text, values});

    return {
      client,
      results,
      table,
      key
    };
  } catch (error) {
    return {
      client,
      table,
      error
    };
  } finally {
    if (clientCreated) {
      client.close();
    }
  }
};

export default del;
