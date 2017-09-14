import defaultsDeep from 'lodash/defaultsDeep';
import createClient from './create-client';
import createTable from './create-table';
import createWatchedTable from './create-watched-table';
import tableExists from './table-exists';
import createStoreIndexes from './create-store-indexes';
import {CREATED, ERROR, EXISTS} from './constants';

const defaults = {
  checkExists: false,
  watch: false,
  watchWhen: false,
  indexes: false,
  columnNames: {
    key: 'key',
    val: 'val',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
};

const createStore = async function ({client, table, index, options}, globals) {
  let clientCreated = false;

  const settings = defaultsDeep({}, options, defaults);
  const {
    watch,
    watchWhen,
    checkExists,
    indexes,
    columnNames
  } = settings;
  const columns = `"${columnNames.key}" text primary key, "${columnNames.val}" jsonb, "${columnNames.createdAt}" timestamp with time zone, "${columnNames.updatedAt}" timestamp with time zone`;

  try {
    if (!client) {
      client = await createClient(options, globals);
      clientCreated = true;
    }

    let results;
    let code;

    let exists = false;

    if (checkExists) {
      const existsResults = await tableExists({client, table});
      exists = existsResults.exists;
    }

    if (exists) {
      code = EXISTS;
    } else {
      if (watch) {
        results = await createWatchedTable({
          client,
          table,
          columns,
          when: watchWhen,
          key: columnNames.key
        });
      } else {
        results = await createTable({client, table, columns});
      }

      const checkResults = await tableExists({client, table});

      if (checkResults.results) {
        code = CREATED;
      } else {
        throw new Error('created table does not exist');
      }
    }

    if (index) {
      await createStoreIndexes({client, table, indexes, columnNames});
    }

    return {
      settings,
      columns,
      client,
      table,
      results,
      code
    };
  } catch (error) {
    error.code = ERROR;
    throw error;
  } finally {
    if (clientCreated) {
      client.close();
    }
  }
};

export default createStore;
