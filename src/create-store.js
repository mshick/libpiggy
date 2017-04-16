import createTable from './create-table';
import createWatchedTable from './create-watched-table';
import tableExists from './table-exists';
import createStoreIndexes from './create-store-indexes';

const createStore = function ({client, table, indexes, watch}) {
  return new Promise((resolve, reject) => {
    tableExists({client, table})
      .then(({exists}) => {
        if (!exists) {
          const columns = 'key text primary key, val jsonb';
          if (watch) {
            return createWatchedTable({client, table, columns, key: 'key'});
          }
          return createTable({client, table, columns});
        }
      })
      .then(() => {
        if (indexes && indexes.length) {
          return createStoreIndexes({client, table, indexes});
        }
      })
      .then(() => {
        resolve({client});
      })
      .catch(error => {
        reject(error);
      });
  });
};

export default createStore;
