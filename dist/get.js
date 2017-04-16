'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _isObject = require('lodash/isObject');

var _isObject2 = _interopRequireDefault(_isObject);

var _isNumber = require('lodash/isNumber');

var _isNumber2 = _interopRequireDefault(_isNumber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getQueryText = function ({ table, key }) {
  let text;

  if ((0, _isObject2.default)(key)) {
    const keys = (0, _keys2.default)(key);
    const wheres = keys.map(k => {
      const v = key[k];
      if ((0, _isNumber2.default)(v)) {
        return `(val ->> '${k}')::int = '${v}'`;
      }
      return `val ->> '${k}' = '${v}'`;
    });
    text = `SELECT * FROM ${table} WHERE ${wheres.join(' AND ')};`;
  } else {
    text = `SELECT * FROM ${table} WHERE key = '${key}';`;
  }

  return text;
};

const get = (() => {
  var _ref = (0, _asyncToGenerator3.default)(function* ({ client, table, key }) {
    try {
      const text = getQueryText({ table, key });
      const results = yield client.query({ text });
      const { val } = results.rows[0] ? results.rows[0] : {};

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

  return function get(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.default = get;
//# sourceMappingURL=get.js.map