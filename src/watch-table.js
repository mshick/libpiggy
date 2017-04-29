import qs from 'qs';

const watchTable = function ({client, table, watcher}) {
  try {
    client.on('notification', ({channel, payload}) => {
      const parsed = qs.parse(payload);
      if (parsed.table === table) {
        watcher({client, channel, payload, parsed});
      }
    });
    return {client};
  } catch (error) {
    return {
      client,
      error
    };
  }
};

export default watchTable;
