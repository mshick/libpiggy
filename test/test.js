import test from 'ava';
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
  {firstName: 'Uzi', lastName: 'Vert', car: 'Prius', age: 40},
  {firstName: 'Lil', lastName: 'Wayne', car: 'Rari', age: 21},
  {firstName: 'Young', lastName: 'Thug', car: 'Lambo', age: 22},
  {firstName: 'Gucci', lastName: 'Mane', car: 'Civic', age: 22},
  {firstName: 'Lil', lastName: 'Yachty', car: 'Prius', age: 30, nested: {foo: 'bar'}}
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
        indexes: [{
          field: 'age',
          type: 'integer'
        }, {
          field: 'lastName',
          type: 'text',
          unique: true,
          lower: true
        }],
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
          direction: 'asc'
        }, {
          field: 'createdAt',
          direction: 'desc'
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

test.serial('and not statements', async t => {
  t.plan(1);

  try {
    const {table} = t.context;
    const sets = FIXTURES.map((val, key) => set({table, key, val}));

    await Promise.all(sets);

    const results = await mget({
      table,
      key: {
        firstName: 'Lil'
      },
      not: {
        car: 'Prius'
      }
    });

    const values = results.rows.map(row => row.val);

    t.is(values[0].lastName, FIXTURES[1].lastName);

    return;
  } catch (err) {
    throw t.fail(err);
  }
});

test.serial('not statements', async t => {
  t.plan(3);

  try {
    const {table} = t.context;
    const sets = FIXTURES.map((val, key) => set({table, key, val}));

    await Promise.all(sets);

    const results = await mget({
      table,
      not: {
        car: 'Prius'
      },
      options: {
        orderBy: [{
          field: 'lastName',
          sort: 'asc'
        }]
      }
    });

    const values = results.rows.map(row => row.val);

    t.is(values[0].lastName, FIXTURES[3].lastName);
    t.is(values[1].lastName, FIXTURES[2].lastName);
    t.is(values[2].lastName, FIXTURES[1].lastName);

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

test.serial('duplicate last name errors', async t => {
  try {
    const {table} = t.context;
    const key = getRandomInt(1000, 1000000);
    const key2 = getRandomInt(1000, 1000000);

    await set({table, key, val: FIXTURES[0]});
    await set({table, key: key2, val: FIXTURES[0]});

    t.fail('should have thrown');
  } catch (err) {
    t.regex(err.message, /duplicate key value violates unique constraint/);
  }
});

test.serial('insert and upsert several values', async t => {
  const {client, table} = t.context;

  try {
    let watcherCalled = false;

    const watcher = () => {
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

    t.deepEqual(got1.val, Object.assign({}, FIXTURES[0], {car: 'Lambo'}));
    t.deepEqual(got2.val, FIXTURES[1]);
    t.deepEqual(got3.val, FIXTURES[4]);
  } catch (err) {
    t.fail(err);
  }
});
