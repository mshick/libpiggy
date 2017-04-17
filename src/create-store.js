import createTable from './create-table';
import createWatchedTable from './create-watched-table';
import tableExists from './table-exists';
import createStoreIndexes from './create-store-indexes';
import {applyToDefaults} from 'hoek';

const defaults = {
  watch: false,
  ginIndex: {
    operator: 'jsonb_path_ops'
  },
  btreeIndex: false
};

const createStore = async function ({client, table, index, options}) {
  const {watch, ginIndex, btreeIndex} = applyToDefaults(defaults, options || {});

  try {
    const results = await tableExists({client, table});
    const {exists} = results;

    if (!exists) {
      const columns = 'key text primary key, val jsonb';
      if (watch) {
        await createWatchedTable({client, table, columns, key: 'key'});
      } else {
        await createTable({client, table, columns});
      }
    }

    if (index) {
      await createStoreIndexes({client, table, ginIndex, btreeIndex});
    }

    return {client};
  } catch (error) {
    return {
      client,
      error
    };
  }
};

export default createStore;
