const set = async function ({client, table, key, val}) {
  try {
    const text = `
      INSERT INTO ${table} (key, val, created_at, updated_at)
        VALUES ('${key}', $1, current_timestamp, current_timestamp);`;
    const values = [val];
    const results = await client.query({text, values});

    return {
      client,
      results,
      key,
      val
    };
  } catch (error) {
    return {
      client,
      error
    };
  }
};

export default set;
