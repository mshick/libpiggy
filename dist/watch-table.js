'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const watchTable = function ({ client, table, watcher }, { state }) {
  const { _openClients } = state;

  _openClients.push(client);

  client.on('notification', ({ channel, payload }) => {
    const parsed = _qs2.default.parse(payload);
    if (parsed.table === table) {
      watcher({ client, channel, payload, parsed });
    }
  });
};

exports.default = watchTable;
//# sourceMappingURL=watch-table.js.map