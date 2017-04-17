import createNotifyTrigger from './create-notify-trigger';

const createWatchedTable = async function ({client, table, columns, key}) {
  try {
    await createNotifyTrigger({client, key});

    const text = `
      CREATE TABLE IF NOT EXISTS ${table} (${columns});
      CREATE TRIGGER watched_table_trigger__${table}
      AFTER INSERT OR UPDATE ON ${table}
      FOR EACH ROW EXECUTE PROCEDURE notify_trigger();
    `;

    const results = await client.query({text});

    return {
      client,
      results
    };
  } catch (error) {
    return {
      client,
      error
    };
  }
};

export default createWatchedTable;
