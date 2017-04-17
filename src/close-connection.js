const closeConnection = async function (options, globals) {
  const {connectionName} = options || {};
  const {state} = globals;

  const closing = [];

  if (connectionName) {
    closing.push(state.openPools[connectionName].end());
  } else {
    for (const poolName of Object.keys(state.openPools)) {
      closing.push(state.openPools[poolName].end());
    }
  }

  await Promise.all(closing);

  if (connectionName) {
    delete state.openPools[connectionName];
  } else {
    state.openPools = {};
  }

  return state;
};

export default closeConnection;
