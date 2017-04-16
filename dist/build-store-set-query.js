'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _isObject = require('lodash/isObject');

var _isObject2 = _interopRequireDefault(_isObject);

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

var _get = require('lodash/get');

var _get2 = _interopRequireDefault(_get);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const pushIndexFactory = function ({
  value,
  keys,
  values,
  placeholders,
  modifier
}) {
  return (ki, i) => {
    const p = i + modifier;
    let k;
    let v;
    if ((0, _isString2.default)(ki)) {
      k = ki;
      v = (0, _get2.default)(value, k);
    } else if ((0, _isArray2.default)(ki)) {
      k = ki[0];
      v = ki[1];
    } else if ((0, _isObject2.default)(ki)) {
      k = (0, _keys2.default)(ki)[0];
      v = ki[k];
    }
    keys.push(k);
    values.push(v);
    placeholders.push(`$${p}`);
  };
};

const buildStoreSetQuery = function ({ key, value, index, table, isUpdate }) {
  const keys = ['val'];
  const placeholders = ['$1'];
  const values = [value];
  const modifier = 2;

  if (index) {
    const pushIndex = pushIndexFactory({
      value,
      keys,
      values,
      placeholders,
      modifier
    });

    if ((0, _isArray2.default)(index)) {
      index.forEach(pushIndex);
    } else if ((0, _isObject2.default)(index)) {
      (0, _keys2.default)(index).forEach((ki, i) => {
        pushIndex([ki, index[ki]], i);
      });
    }
  }

  let text;

  if (isUpdate) {
    text = `UPDATE ${table} SET (${keys.join(', ')}) = (${placeholders.join(', ')}) WHERE key = '${key}';`;
  } else {
    text = `INSERT INTO ${table} (key, ${keys.join(', ')}) VALUES ('${key}', ${placeholders.join(', ')});`;
  }

  return { text, values };
};

exports.default = buildStoreSetQuery;
//# sourceMappingURL=build-store-set-query.js.map