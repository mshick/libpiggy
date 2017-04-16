'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _buildStoreSetQuery = require('./build-store-set-query');

var _buildStoreSetQuery2 = _interopRequireDefault(_buildStoreSetQuery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const set = (() => {
  var _ref = (0, _asyncToGenerator3.default)(function* ({ client, table, key, val }) {
    try {
      const q = (0, _buildStoreSetQuery2.default)({ key, value: val, table });
      const results = yield client.query(q);

      return {
        client,
        results,
        key,
        val
      };
    } catch (error) {
      return {
        client,
        error
      };
    }
  });

  return function set(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.default = set;
//# sourceMappingURL=set.js.map