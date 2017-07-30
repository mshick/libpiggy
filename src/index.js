export {default as mget} from './mget';
export {default as get} from './get';
export {default as set} from './set';
export {default as upsert} from './upsert';
export {default as del} from './del';
export {default as createNotifyFunction} from './create-notify-function';
export {default as createStore} from './create-store';
export {default as createTable} from './create-table';
export {default as createWatchedTable} from './create-watched-table';
export {default as tableExists} from './table-exists';
export {default as watchTable} from './watch-table';
export {default as getTableColumns} from './get-table-columns';
export {default as listen} from './listen';

import create from './create-connection';
import close from './close-connection';

const state = {
  openPools: {},
  openClients: []
};

export const createConnection = async function (options, globals = {}) {
  globals.state = globals.state || state;
  return create(options, globals);
};

export const closeConnection = async function (options, globals = {}) {
  globals.state = globals.state || state;
  return close(options, globals);
};
