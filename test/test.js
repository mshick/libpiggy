import test from 'ava';
import createConnection from '../src/create-connection';
import createStore from '../src/create-store';
import closeConnection from '../src/close-connection';
import upsert from '../src/upsert';
import get from '../src/get';

const getRandomInt = function (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

const {POSTGRESQL_URL} = process.env;

const TABLE_NAME = `libpiggy_test`;

const DEFAULTS = {
  connectionName: 'default',
  url: POSTGRESQL_URL,
  connection: {
    ssl: true,
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

test(async t => {
  const client = await createConnection(null, {state: STATE, options: DEFAULTS});

  const createResults = await createStore({
    client,
    table: TABLE_NAME,
    index: true,
    options: {
      btreeIndex: {
        fields: [['age', 'integer']]
      }
    }
  });

  t.is(createResults.results, 'CREATED');

  await upsert({
    client,
    table: TABLE_NAME,
    val: FIXTURES[0],
    generateKeyFn: () => getRandomInt(1000, 1000000)
  });

  await upsert({
    client,
    table: TABLE_NAME,
    val: FIXTURES[1],
    generateKeyFn: () => getRandomInt(1000, 1000000)
  });

  await upsert({
    client,
    table: TABLE_NAME,
    val: FIXTURES[2],
    generateKeyFn: () => getRandomInt(1000, 1000000)
  });

  await upsert({
    client,
    table: TABLE_NAME,
    val: FIXTURES[3],
    generateKeyFn: () => getRandomInt(1000, 1000000)
  });

  await upsert({
    client,
    table: TABLE_NAME,
    key: {lastName: FIXTURES[0].lastName},
    val: {car: 'Lambo'},
    options: {merge: true},
    generateKeyFn: () => getRandomInt(1000, 1000000)
  });

  const got1 = await get({
    client,
    table: TABLE_NAME,
    key: {car: 'Lambo'}
  });

  // console.log(got1.createdAt);

  const got2 = await get({
    client,
    table: TABLE_NAME,
    key: {age: 21}
  });

  // console.log(got2.val);

  const got3 = await get({
    client,
    table: TABLE_NAME,
    key: {nested: {foo: 'bar'}}
  });

  // console.log(got3.val);

  await client.query(`DROP TABLE ${TABLE_NAME}`);

  client.close();

  await closeConnection(null, {state: STATE});

  t.deepEqual(got1.val, Object.assign({}, FIXTURES[0], {car: 'Lambo'}));
  t.deepEqual(got2.val, FIXTURES[1]);
  t.deepEqual(got3.val, FIXTURES[3]);
});
