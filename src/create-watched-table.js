import createNotifyTrigger from './create-notify-trigger';

const createWatchedTable = function ({client, table, columns, key}) {
  return createNotifyTrigger({client, key})
    .then(() => {
      return client.query(`
        CREATE TABLE IF NOT EXISTS ${table} (${columns});
        CREATE TRIGGER watched_table_trigger__${table}
        AFTER INSERT OR UPDATE ON ${table}
        FOR EACH ROW EXECUTE PROCEDURE notify_trigger();
      `);
    })
    .then(results => {
      return {
        client,
        results
      };
    });
};

export default createWatchedTable;
