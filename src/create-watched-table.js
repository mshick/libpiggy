import createTable from './create-table';
import createNotifyTrigger from './create-notify-trigger';

const createWatchedTable = async function ({client, table, columns, key}) {
  try {
    await createNotifyTrigger({client, table, key});

    await createTable({client, table, columns});

    const text = `
      CREATE TRIGGER watched_table_trigger__${table}
      BEFORE INSERT OR UPDATE OR DELETE ON ${table}
      AFTER INSERT OR UPDATE OR DELETE ON ${table}
      FOR EACH ROW EXECUTE PROCEDURE notify_trigger__${table}();
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
