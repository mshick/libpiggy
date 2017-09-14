const listen = async function ({client}) {
  try {
    await client.query(`LISTEN watchers`);
    return {client};
  } catch (error) {
    throw error;
  }
};

export default listen;
