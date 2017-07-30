import {CREATED, EXISTS, ERROR} from './constants';
import _createConnection from './create-connection';
import _closeConnection from './close-connection';
import _createStore from './create-store';
import _tableExists from './table-exists';
import _watchTable from './watch-table';
import _getTableColumns from './get-table-columns';
import _mget from './mget';
import _get from './get';
import _set from './set';
import _upsert from './upsert';
import _del from './del';

const STATE = {
  openPools: {},
  openClients: []
};

const STORES = {};

/* Exports */

export const state = STATE;
export const stores = STORES;
export const constants = {CREATED, EXISTS, ERROR};

export const createConnection = async function (options, globals = {}) {
  globals.state = globals.state || STATE;
  return _createConnection(options, globals);
};

export const closeConnection = async function (options, globals = {}) {
  globals.state = globals.state || STATE;
  return _closeConnection(options, globals);
};

export const createStore = async function (options) {
  const store = await _createStore(options);
  STORES[store.table] = store;
  return store;
};

export const tableExists = async function (args) {
  args.store = STORES[args.table];
  return _tableExists(args);
};

export const watchTable = async function (args) {
  args.store = STORES[args.table];
  return _watchTable(args);
};

export const getTableColumns = async function (args) {
  args.store = STORES[args.table];
  return _getTableColumns(args);
};

export const mget = async function (args) {
  args.store = STORES[args.table];
  return _mget(args);
};

export const get = async function (args) {
  args.store = STORES[args.table];
  return _get(args);
};

export const set = async function (args) {
  args.store = STORES[args.table];
  return _set(args);
};

export const upsert = async function (args) {
  args.store = STORES[args.table];
  return _upsert(args);
};

export const del = async function (args) {
  args.store = STORES[args.table];
  return _del(args);
};

export {default as listen} from './listen';

/* Deprecated */

export {default as createTable} from './create-table';
export {default as createNotifyFunction} from './create-notify-function';
export {default as createWatchedTable} from './create-watched-table';
