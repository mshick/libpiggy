import qs from 'qs';

const isTrigger = function ({table, when, parsed}) {
  if (parsed.table !== table) {
    return false;
  }

  if (!when) {
    return true;
  }

  if (parsed.when === when) {
    return true;
  }

  return false;
};

const watchTable = function ({client, table, when, watcher, store}) {
  client = client || store.client;

  try {
    client.on('notification', ({channel, payload}) => {
      const parsed = qs.parse(payload);
      const trigger = isTrigger({table, when, parsed});
      if (trigger) {
        watcher({client, channel, payload, parsed});
      }
    });
    return {client};
  } catch (error) {
    throw error;
  }
};

export default watchTable;
