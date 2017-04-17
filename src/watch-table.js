import qs from 'qs';

const watchTable = function ({client, table, watcher}) {
  client.on('notification', ({channel, payload}) => {
    const parsed = qs.parse(payload);
    if (parsed.table === table) {
      watcher({client, channel, payload, parsed});
    }
  });
};

export default watchTable;
