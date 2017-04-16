'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _createTable = require('./create-table');

var _createTable2 = _interopRequireDefault(_createTable);

var _createWatchedTable = require('./create-watched-table');

var _createWatchedTable2 = _interopRequireDefault(_createWatchedTable);

var _tableExists = require('./table-exists');

var _tableExists2 = _interopRequireDefault(_tableExists);

var _createStoreIndexes = require('./create-store-indexes');

var _createStoreIndexes2 = _interopRequireDefault(_createStoreIndexes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const createStore = function ({ client, table, indexes, watch }) {
  return new _promise2.default((resolve, reject) => {
    (0, _tableExists2.default)({ client, table }).then(({ exists }) => {
      if (!exists) {
        const columns = 'key text primary key, val jsonb';
        if (watch) {
          return (0, _createWatchedTable2.default)({ client, table, columns, key: 'key' });
        }
        return (0, _createTable2.default)({ client, table, columns });
      }
    }).then(() => {
      if (indexes && indexes.length) {
        return (0, _createStoreIndexes2.default)({ client, table, indexes });
      }
    }).then(() => {
      resolve({ client });
    }).catch(error => {
      reject(error);
    });
  });
};

exports.default = createStore;
//# sourceMappingURL=create-store.js.map