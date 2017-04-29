const listen = function ({client}) {
  client.query(`LISTEN watchers`);
};

export default listen;
