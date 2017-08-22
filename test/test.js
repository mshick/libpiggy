import test from 'ava';
import {promisify} from 'util';
import {
  createPool,
  createClient,
  closeConnection,
  createStore,
  watchTable,
  listen,
  upsert,
  get,
  set,
  del,
  mget
} from '../src/index';

const sleep = setTimeout[promisify.custom];

const getRandomInt = function (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

const {POSTGRES_USER, POSTGRES_DB} = process.env;
const PG_URL = `postgresql://${POSTGRES_USER}@localhost/${POSTGRES_DB}`;

const CONFIG = {
  url: PG_URL,
  connection: {
    ssl: false,
    max: 10,
    min: 4,
    idleTimeoutMillis: 30000
  }
};

const FIXTURES = [
  {firstName: 'Cool', lastName: 'Foo', car: 'Prius', age: 40},
  {firstName: 'Little', lastName: 'Guy', car: 'Rari', age: 21},
  {firstName: 'BIG', lastName: 'Guy', car: 'Lambo', age: 22},
  {firstName: 'Double', lastName: 'Trouble', car: 'Civic', age: 22},
  {firstName: 'King', lastName: 'Kong', car: 'Prius', age: 30, nested: {foo: 'bar'}}
];

test.before('create connection pool', async t => {
  try {
    return createPool(CONFIG);
  } catch (err) {
    t.fail(err);
  }
});

test.beforeEach('create connection', async t => {
  try {
    const client = await createClient(CONFIG);
    const table = `Test${getRandomInt(10000, 999999)}`;

    const createResults = await createStore({
      client,
      table,
      index: true,
      options: {
        watch: true,
        btreeIndex: {
          fields: [['age', 'integer']]
        },
        columnNames: {
          createdAt: 'createdAt',
          updatedAt: 'updatedAt'
        }
      }
    });

    if (createResults.code === 'ERROR') {
      throw (createResults);
    }

    t.is(createResults.code, 'CREATED');

    t.context.client = client;
    t.context.table = table;
  } catch (err) {
    t.fail(err);
  }
});

test.afterEach('cleanup', async t => {
  const {client, table} = t.context;
  await client.query(`DROP TABLE "${table}"`);
  client.close();
});

test.always.after('close connection', () => {
  closeConnection();
});

test.serial('set', async t => {
  try {
    const {table} = t.context;
    const key = getRandomInt(1000, 1000000);
    await set({table, key, val: FIXTURES[0]});
    const {val} = await get({table, key});
    t.deepEqual(val, FIXTURES[0]);
  } catch (err) {
    t.fail(err);
  }
});

test.serial('set default key generation', async t => {
  try {
    const {table} = t.context;
    const {key} = await set({table, val: FIXTURES[0]});
    const {val} = await get({table, key});
    t.deepEqual(val, FIXTURES[0]);
  } catch (err) {
    t.fail(err);
  }
});

test.serial('set custom key generation', async t => {
  try {
    const {table} = t.context;
    const generateKeyFn = () => getRandomInt(1000, 1000000);
    const {key} = await set({table, val: FIXTURES[0], generateKeyFn});
    const {val} = await get({table, key});
    t.deepEqual(val, FIXTURES[0]);
  } catch (err) {
    t.fail(err);
  }
});

test.serial('set many', async t => {
  try {
    const {table} = t.context;
    const sets = FIXTURES.map((val, key) => set({table, key, val}));
    const setResults = await Promise.all(sets);
    const gets = setResults.map(({key}) => get({table, key}));
    const getResults = await Promise.all(gets);

    const results = [];
    getResults.forEach(res => {
      results[res.key] = res.val;
    });

    t.deepEqual(results, FIXTURES);
  } catch (err) {
    t.fail(err);
  }
});

test.serial('multiple orderBy statements', async t => {
  t.plan(5);

  try {
    const {table} = t.context;
    const sets = FIXTURES.map((val, key) => set({table, key, val}));

    await Promise.all(sets);

    const results = await mget({
      table,
      key: '%',
      options: {
        orderBy: [{
          field: 'age',
          sort: 'asc'
        }, {
          field: 'createdAt',
          sort: 'desc'
        }]
      }
    });

    const values = results.rows.map(row => row.val);

    t.is(values[0].age, FIXTURES[1].age);
    t.is(values[1].age, FIXTURES[2].age);
    t.is(values[2].age, FIXTURES[3].age);
    t.is(values[3].age, FIXTURES[4].age);
    t.is(values[4].age, FIXTURES[0].age);

    return;
  } catch (err) {
    throw t.fail(err);
  }
});

test.serial('upsert', async t => {
  try {
    const {table} = t.context;
    const key = getRandomInt(1000, 1000000);
    await upsert({table, key, val: FIXTURES[1]});
    const {val} = await get({table, key});
    t.deepEqual(val, FIXTURES[1]);
  } catch (err) {
    t.fail(err);
  }
});

test.serial('upsert custom key generation', async t => {
  try {
    const {table} = t.context;
    const {key} = await upsert({
      table,
      val: FIXTURES[1],
      generateKeyFn: () => getRandomInt(1000, 1000000)
    });
    const {val} = await get({table, key});
    t.deepEqual(val, FIXTURES[1]);
  } catch (err) {
    t.fail(err);
  }
});

test.serial('del', async t => {
  try {
    const {table} = t.context;
    const key = getRandomInt(1000, 1000000);
    await set({table, key, val: FIXTURES[0]});
    await del({table, key});
    const results = await get({table, key});
    t.is(results.key, undefined);
  } catch (err) {
    t.fail(err);
  }
});

test.serial('insert and upsert several values', async t => {
  const {client, table} = t.context;

  try {
    let watcherCount = 0;
    let watcherCalled = false;

    const watcher = () => {
      watcherCount += 1;
      watcherCalled = true;
    };

    watchTable({client, table, watcher});

    listen({client});

    await upsert({
      table,
      val: FIXTURES[0]
    });

    await upsert({
      table,
      val: FIXTURES[1]
    });

    await upsert({
      table,
      val: FIXTURES[2]
    });

    await upsert({
      table,
      val: FIXTURES[4]
    });

    await upsert({
      table,
      key: {lastName: FIXTURES[0].lastName},
      val: {car: 'Lambo'},
      options: {merge: true}
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
    t.deepEqual(got3.val, FIXTURES[4]);
  } catch (err) {
    t.fail(err);
  }
});
