import createTable from './create-table';
import createNotifyFunction from './create-notify-function';

const createWatchedTable = async function ({client, table, columns, when, key}) {
  try {
    await createNotifyFunction({client, table, key});

    await createTable({client, table, columns});

    const textBefore = `
      CREATE TRIGGER "watched_table_trigger_before__${table}"
      BEFORE INSERT OR UPDATE OR DELETE ON "${table}"
      FOR EACH ROW EXECUTE PROCEDURE notify_trigger();
    `;

    const textAfter = `
      CREATE TRIGGER "watched_table_trigger_after__${table}"
      AFTER INSERT OR UPDATE OR DELETE ON "${table}"
      FOR EACH ROW EXECUTE PROCEDURE notify_trigger();
    `;

    let text;

    if (when && when === 'BEFORE') {
      text = textBefore;
    }

    if (when && when === 'AFTER') {
      text = textAfter;
    }

    if (!when) {
      text = `
        ${textBefore}
        ${textAfter}
      `;
    }

    const results = await client.query({text});

    return {
      client,
      results
    };
  } catch (error) {
    throw error;
  }
};

export default createWatchedTable;
