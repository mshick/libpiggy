import defaultsDeep from 'lodash/defaultsDeep';
import createTable from './create-table';
import createWatchedTable from './create-watched-table';
import tableExists from './table-exists';
import createStoreIndexes from './create-store-indexes';

const defaults = {
  checkExists: false,
  watch: false,
  watchWhen: false,
  ginIndex: {
    operator: 'jsonb_path_ops'
  },
  btreeIndex: false
};

const CREATED = 'CREATED';
const EXISTS = 'EXISTS';
const ERROR = 'ERROR';

const createStore = async function ({client, table, index, options}) {
  const settings = defaultsDeep({}, options, defaults);

  const {watch, watchWhen, checkExists, ginIndex, btreeIndex} = settings;

  try {
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
      const columns = 'key text primary key, val jsonb, created_at timestamp with time zone, updated_at timestamp with time zone';

      if (watch) {
        results = await createWatchedTable({client, table, columns, when: watchWhen, key: 'key'});
      } else {
        results = await createTable({client, table, columns});
      }

      if (index) {
        await createStoreIndexes({client, table, ginIndex, btreeIndex});
      }

      const checkResults = await tableExists({client, table});

      if (checkResults.results) {
        code = CREATED;
      } else {
        throw new Error('created table does not exist');
      }
    }

    return {client, results, code};
  } catch (error) {
    return {
      client,
      code: ERROR,
      error
    };
  }
};

export default createStore;
