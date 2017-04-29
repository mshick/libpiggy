const listen = async function ({client}) {
  try {
    await client.query(`LISTEN watchers`);
    return {client};
  } catch (error) {
    return {
      client,
      error
    };
  }
};

export default listen;
