import get from './get';

const set = async function ({store, client, table, key, val}) {
  try {
    const {columnNames} = store.settings;

    const text = `
      INSERT INTO "${table}" ("${columnNames.key}", "${columnNames.val}", "${columnNames.createdAt}", "${columnNames.updatedAt}")
        VALUES ('${key}', $1, current_timestamp, current_timestamp);`;

    const values = [val];

    await client.query({text, values});

    return get({client, table, key});
  } catch (error) {
    return {
      client,
      error
    };
  }
};

export default set;
