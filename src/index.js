import defaultsDeep from 'lodash/defaultsDeep';

import {CREATED, EXISTS, ERROR} from './constants';
import _createPool from './create-pool';
import _createClient from './create-client';
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

const DEFAULTS = {
  connectionName: 'default'
};

const STATE = {
  openPools: {},
  openClients: []
};

const STORES = {};

const setGlobals = globals => {
  globals.state = STATE;
  globals.stores = STORES;
  globals.options = defaultsDeep({}, globals.options, DEFAULTS);
};

/* Exports */

export const state = STATE;
export const stores = STORES;
export const constants = {CREATED, EXISTS, ERROR};

export const createPool = async function (options, globals = {}) {
  setGlobals(globals);
  const settings = defaultsDeep({}, options, globals.options, DEFAULTS);
  return _createPool(settings, globals);
};

export const createClient = async function (options, globals = {}) {
  setGlobals(globals);
  const settings = defaultsDeep({}, options, globals.options, DEFAULTS);
  return _createClient(settings, globals);
};

export const createConnection = async function (options, globals = {}) {
  setGlobals(globals);
  const settings = defaultsDeep({}, options, globals.options, DEFAULTS);

  if (!globals.state.openPools[settings.connectionName]) {
    await _createPool(settings, globals);
  }

  return _createClient(settings, globals);
};

export const closeConnection = async function (options, globals = {}) {
  setGlobals(globals);
  return _closeConnection(options, globals);
};

export const createStore = async function (options, globals = {}) {
  setGlobals(globals);
  const store = await _createStore(options, globals);
  STORES[store.table] = store;
  return store;
};

export const tableExists = async function (args, globals) {
  setGlobals(globals);
  args.store = globals.stores[args.table];
  return _tableExists(args, globals);
};

export const watchTable = async function (args, globals = {}) {
  setGlobals(globals);
  args.store = globals.stores[args.table];
  return _watchTable(args, globals);
};

export const getTableColumns = async function (args, globals = {}) {
  setGlobals(globals);
  args.store = globals.stores[args.table];
  return _getTableColumns(args, globals);
};

export const mget = async function (args, globals = {}) {
  setGlobals(globals);
  args.store = globals.stores[args.table];
  return _mget(args, globals);
};

export const get = async function (args, globals = {}) {
  setGlobals(globals);
  args.store = globals.stores[args.table];
  return _get(args, globals);
};

export const set = async function (args, globals = {}) {
  setGlobals(globals);
  args.store = globals.stores[args.table];
  return _set(args, globals);
};

export const upsert = async function (args, globals = {}) {
  setGlobals(globals);
  args.store = globals.stores[args.table];
  return _upsert(args, globals);
};

export const del = async function (args, globals = {}) {
  setGlobals(globals);
  args.store = globals.stores[args.table];
  return _del(args, globals);
};

export {default as listen} from './listen';

/* Deprecated */

export {default as createTable} from './create-table';
export {default as createNotifyFunction} from './create-notify-function';
export {default as createWatchedTable} from './create-watched-table';
