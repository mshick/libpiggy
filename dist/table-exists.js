"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const tableExists = (() => {
  var _ref = (0, _asyncToGenerator3.default)(function* ({ client, table }) {
    try {
      const text = `SELECT to_regclass('${table}');`;
      const results = yield client.query({ text });

      return {
        client,
        results,
        exists: Boolean(results.rows[0].to_regclass)
      };
    } catch (error) {
      return {
        client,
        error
      };
    }
  });

  return function tableExists(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.default = tableExists;
//# sourceMappingURL=table-exists.js.map