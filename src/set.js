const set = async function ({client, table, key, val}) {
  try {
    const text = `INSERT INTO ${table} (key, val) VALUES ('${key}', $1);`;
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
