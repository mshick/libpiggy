"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const del = (() => {
  var _ref = (0, _asyncToGenerator3.default)(function* ({ client, table, key }) {
    try {
      const text = `DELETE FROM ${table} WHERE key = $1;`;
      const values = [key];
      const results = yield client.query({ text, values });

      return {
        client,
        results,
        key
      };
    } catch (error) {
      return {
        client,
        error
      };
    }
  });

  return function del(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.default = del;
//# sourceMappingURL=del.js.map