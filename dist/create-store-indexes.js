'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const createIndexes = function ({ client, table, indexes }) {
  let text = '';

  if (indexes && indexes.length) {
    indexes.forEach(index => {
      if (index === 'key' || index === 'val') {
        _assert2.default.fail(false, `'key' and 'val' are not valid indexes`);
      }

      let jsonPath;

      if ((0, _isArray2.default)(index) && index[1] === 'int') {
        jsonPath = `(((val ->> '${index[0]}')::integer))`;
      } else {
        jsonPath = `((val ->> '${index}'))`;
      }

      text += `
        CREATE INDEX IF NOT EXISTS "${table}_${index}_index" ON ${table} ${jsonPath};
      `;
    });
  }

  if (!text) {
    return _promise2.default.resolve({ client });
  }

  return client.query({ text }).then(results => {
    return {
      client,
      results
    };
  });
};

exports.default = createIndexes;
//# sourceMappingURL=create-store-indexes.js.map