"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const getTableColumns = function ({ client, table }) {
  return client.query({
    text: `
      SELECT *
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name   = '${table}'
    `
  }).then(results => {
    return {
      client,
      columns: results.rows
    };
  });
};

exports.default = getTableColumns;
//# sourceMappingURL=get-table-columns.js.map