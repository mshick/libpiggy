const closePools = async function ({state}) {
  const closing = [];

  for (const poolName of Object.keys(state.openPools)) {
    closing.push(state.openPools[poolName].end());
  }

  await Promise.all(closing);

  state.openPools = {};

  return state;
};

export default closePools;
