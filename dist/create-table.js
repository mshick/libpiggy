"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const createTable = function ({ client, table, columns }) {
  const text = `
    CREATE TABLE IF NOT EXISTS ${table} (${columns});
  `;

  return client.query({ text }).then(results => {
    return {
      client,
      results
    };
  });
};

exports.default = createTable;
//# sourceMappingURL=create-table.js.map