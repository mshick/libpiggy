import createTable from './create-table';
import createNotifyTrigger from './create-notify-trigger';

const createWatchedTable = async function ({client, table, columns, when, key}) {
  try {
    await createNotifyTrigger({client, table, key});

    await createTable({client, table, columns});

    let text = `
      CREATE TRIGGER watched_table_trigger_after__${table}
    `;

    if (when && when === 'BEFORE') {
      text += `
        BEFORE INSERT OR UPDATE OR DELETE ON ${table}
      `;
    }

    if (when && when === 'AFTER') {
      text += `
        AFTER INSERT OR UPDATE OR DELETE ON ${table}
      `;
    }

    if (!when) {
      text += `
        BEFORE INSERT OR UPDATE OR DELETE ON ${table}
        AFTER INSERT OR UPDATE OR DELETE ON ${table}
      `;
    }

    text += `
      FOR EACH ROW EXECUTE PROCEDURE notify__${table}();
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
