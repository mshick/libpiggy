'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _shortid = require('shortid');

var _shortid2 = _interopRequireDefault(_shortid);

var _hoek = require('hoek');

var _get = require('./get');

var _get2 = _interopRequireDefault(_get);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getQueryText = function ({ table, key, existingKey }) {
  let text;

  if (existingKey) {
    text = `UPDATE ${table} SET (val) = ($1) WHERE key = '${key}';`;
  } else {
    text = `INSERT INTO ${table} (key, val) VALUES ('${key}', $1);`;
  }

  return text;
};

const getVal = function ({ existingVal, newVal, merge }) {
  let val = {};

  if (merge && existingVal) {
    val = (0, _hoek.applyToDefaults)(existingVal, newVal, true);
  } else {
    val = newVal;
  }

  return val;
};

const upsert = (() => {
  var _ref = (0, _asyncToGenerator3.default)(function* ({
    client,
    table,
    key,
    val: newVal,
    options,
    generateKeyFn
  }) {
    try {
      const { merge } = options || {};

      generateKeyFn = generateKeyFn || _shortid2.default.generate;

      const got = (yield key) && (0, _get2.default)({ client, table, key });

      let existingKey;
      let existingVal;

      if (got) {
        existingKey = got.key;
        existingVal = got.val;
      }

      key = existingKey || key;

      if (!key || typeof key !== 'string') {
        key = generateKeyFn();
      }

      const text = getQueryText({ table, key, existingKey });
      const val = getVal({ existingVal, newVal, merge });
      const values = [val];
      const results = yield client.query({ text, values });

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

  return function upsert(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.default = upsert;
//# sourceMappingURL=upsert.js.map