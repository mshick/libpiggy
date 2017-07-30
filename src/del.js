const del = async function ({client, table, key, store}) {
  try {
    const {columnNames} = store.settings;
    const text = `DELETE FROM "${table}" WHERE "${columnNames.key}" = $1;`;
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
