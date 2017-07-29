import get from './get';

const set = async function ({client, table, key, val}) {
  try {
    const text = `
      INSERT INTO "${table}" ("key", "val", "created_at", "updated_at")
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
