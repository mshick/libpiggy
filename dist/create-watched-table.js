'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createNotifyTrigger = require('./create-notify-trigger');

var _createNotifyTrigger2 = _interopRequireDefault(_createNotifyTrigger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const createWatchedTable = function ({ client, table, columns, key }) {
  return (0, _createNotifyTrigger2.default)({ client, key }).then(() => {
    return client.query(`
        CREATE TABLE IF NOT EXISTS ${table} (${columns});
        CREATE TRIGGER watched_table_trigger__${table}
        AFTER INSERT OR UPDATE ON ${table}
        FOR EACH ROW EXECUTE PROCEDURE notify_trigger();
      `);
  }).then(results => {
    return {
      client,
      results
    };
  });
};

exports.default = createWatchedTable;
//# sourceMappingURL=create-watched-table.js.map