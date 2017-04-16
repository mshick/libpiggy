'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _hoek = require('hoek');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let pg;

try {
  require('pg-native');
  pg = require('pg').native;
} catch (e) {
  pg = require('pg');
}

const urlToConfig = function (connectionUrl) {
  const { hostname: host, port, pathname, auth } = _url2.default.parse(connectionUrl);
  const [user, password] = auth ? auth.split(':') : [];
  const [, database] = pathname ? pathname.split('/') : [];

  return {
    user,
    password,
    host,
    port,
    database
  };
};

const createConnection = function (userOptions, plugin) {
  const { options: pluginOptions, state: pluginState } = plugin;
  const options = (0, _hoek.applyToDefaults)(pluginOptions, userOptions || {});

  const {
    url: connectionUrl,
    connectionName,
    connection: connectionOptions
  } = options;

  const { _openPools } = pluginState;

  if (!_openPools[connectionName]) {
    const connectionConfig = urlToConfig(connectionUrl);
    const config = (0, _hoek.applyToDefaults)(connectionConfig, connectionOptions);
    _openPools[connectionName] = new pg.Pool(config);
  }

  return _openPools[connectionName].connect().then(client => {
    return { client };
  });
};

exports.default = createConnection;
//# sourceMappingURL=create-connection.js.map