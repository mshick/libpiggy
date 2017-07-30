import test from 'ava';
import {
  createConnection,
  closeConnection,
  createStore,
  watchTable,
  listen,
  upsert,
  get
} from '../src/index';

const getRandomInt = function (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

const {POSTGRES_USER, POSTGRES_DB} = process.env;
const PG_URL = `postgresql://${POSTGRES_USER}@localhost/${POSTGRES_DB}`;

const DEFAULTS = {
  connectionName: 'default',
  url: PG_URL,
  connection: {
    ssl: false,
    max: 10,
    min: 4,
    idleTimeoutMillis: 30000
  }
};

const STATE = {
  openPools: {},
  openClients: []
};

const FIXTURES = [
  {firstName: 'Cool', lastName: 'Foo', car: 'Prius', age: 16},
  {firstName: 'Little', lastName: 'Guy', car: 'Rari', age: 21},
  {firstName: 'BIG', lastName: 'Guy', car: 'Lambo', age: 22},
  {firstName: 'King', lastName: 'Kong', car: 'Prius', age: 30, nested: {foo: 'bar'}}
];

test.beforeEach('create connection', async t => {
  const client = await createConnection(null, {
    state: STATE,
    options: DEFAULTS
  });

  const table = `Test${getRandomInt(10000, 999999)}`;

  let createResults;

  try {
    createResults = await createStore({
      client,
      table,
      index: true,
      options: {
        watch: true,
        btreeIndex: {
          fields: [['age', 'integer']]
        }
      }
    });
  } catch (error) {
    console.log(error);
    t.fail();
  }

  if (createResults.code === 'ERROR') {
    console.log(createResults);
  }

  t.is(createResults.code, 'CREATED');

  t.context.client = client;
  t.context.table = table;
});

test.afterEach('cleanup', async t => {
  const {client, table} = t.context;
  await client.query(`DROP TABLE "${table}"`);
  client.close();
  await closeConnection(null, {state: STATE});
});

test('everything...', async t => {
  const {client, table} = t.context;

  let watcherCount = 0;
  let watcherCalled = false;

  const watcher = () => {
    watcherCount += 1;
    watcherCalled = true;
  };

  watchTable({table, watcher});

  listen({client});

  await upsert({
    table,
    val: FIXTURES[0],
    generateKeyFn: () => getRandomInt(1000, 1000000)
  });

  await upsert({
    table,
    val: FIXTURES[1],
    generateKeyFn: () => getRandomInt(1000, 1000000)
  });

  await upsert({
    table,
    val: FIXTURES[2],
    generateKeyFn: () => getRandomInt(1000, 1000000)
  });

  await upsert({
    table,
    val: FIXTURES[3],
    generateKeyFn: () => getRandomInt(1000, 1000000)
  });

  await upsert({
    table,
    key: {lastName: FIXTURES[0].lastName},
    val: {car: 'Lambo'},
    options: {merge: true},
    generateKeyFn: () => getRandomInt(1000, 1000000)
  });

  const got1 = await get({
    table,
    key: {car: 'Lambo'}
  });

  const got2 = await get({
    table,
    key: {age: 21}
  });

  const got3 = await get({
    table,
    key: {nested: {foo: 'bar'}}
  });

  t.is(watcherCalled, true);
  t.is(watcherCount, 10);

  t.deepEqual(got1.val, Object.assign({}, FIXTURES[0], {car: 'Lambo'}));
  t.deepEqual(got2.val, FIXTURES[1]);
  t.deepEqual(got3.val, FIXTURES[3]);
});
