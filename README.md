# pg-extensions

Add more functions into the original `pg` package: query builder, extended pool, and extended client & log option. It helps us to interact with Postgres easier than using an external ORM. Support Promise & Observable.

![npm (scoped)](https://img.shields.io/npm/v/@tqt/pg-extensions)
![Typed with TypeScript](https://flat.badgen.net/badge/icon/Typed?icon=typescript&label&labelColor=blue&color=555555)
![Eslint](https://badgen.net/badge/eslint/airbnb/ff5a5f?icon=airbnb)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
![GitHub](https://img.shields.io/github/license/thinhtran3588/pg-extensions)
![GitHub repo size](https://img.shields.io/github/repo-size/thinhtran3588/pg-extensions)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/thinhtran3588/pg-extensions)

**main:**
![CI-main](https://github.com/thinhtran3588/pg-extensions/workflows/CI-main/badge.svg)
[![codecov](https://codecov.io/gh/thinhtran3588/pg-extensions/branch/main/graph/badge.svg)](https://codecov.io/gh/thinhtran3588/pg-extensions)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=thinhtran3588_pg-extensions&metric=alert_status)](https://sonarcloud.io/dashboard?id=thinhtran3588_pg-extensions)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=thinhtran3588_pg-extensions&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=thinhtran3588_pg-extensions)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=thinhtran3588_pg-extensions&metric=security_rating)](https://sonarcloud.io/dashboard?id=thinhtran3588_pg-extensions)

**develop:**
![CI-develop](https://github.com/thinhtran3588/pg-extensions/workflows/CI-develop/badge.svg?branch=develop)
[![codecov](https://codecov.io/gh/thinhtran3588/pg-extensions/branch/develop/graph/badge.svg)](https://codecov.io/gh/thinhtran3588/pg-extensions/branch/develop)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=thinhtran3588_pg-extensions&branch=develop&metric=alert_status)](https://sonarcloud.io/dashboard?id=thinhtran3588_pg-extensions&branch=develop)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=thinhtran3588_pg-extensions&branch=develop&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=thinhtran3588_pg-extensions&branch=develop)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=thinhtran3588_pg-extensions&branch=develop&metric=security_rating)](https://sonarcloud.io/dashboard?id=thinhtran3588_pg-extensions&branch=develop)

## Installation

```bash
yarn add @tqt/pg-extensions
```

## Documentation

- [1. With Promise](#with-promise)
  - [Initialize pool](#initialize-pool-promise)
  - [Query](#query-promise)
  - [Count](#count-promise)
  - [Get by id](#get-by-id-promise)
  - [Create](#create-promise)
  - [Update](#update-promise)
  - [Remove](#remove-promise)
  - [Execute transaction](#execute-transaction-promise)
- [2. With Observable](#with-observable)
  - [Initialize pool](#initialize-pool-observable)
  - [Query](#query-observable)
  - [Count](#count-observable)
  - [Get by id](#get-by-id-observable)
  - [Create](#create-observable)
  - [Update](#update-observable)
  - [Remove](#remove-observable)
  - [Execute transaction](#execute-transaction-observable)

## With Promise

### Initialize pool (Promise)

```typescript
import {Pool} from '@tqt/pg-extensions';

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: +process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: Boolean(process.env.POSTGRES_SSL),
  // new option, optional
  log: (message: string | {queryText: string; params: unknown[] | undefined; duration: number}) => {
    console.log(message);
    // should log message or the query execution (only queries from extended functions are logged):
    // {
    //  queryText: "select * from app_user where id = $1",
    //  params: [1],
    //  duration: 100, --milliseconds
    // }
  },
});
pool.on('error', (err) => console.log(err));
pool.on('connect', () => console.log('Connected to database'));
```

### Query (Promise)

Use this function instead of the original **pool.query** function.

```typescript
const result = await pool.executeQuery({
  queryText: 'select id, username, createAt as "createdAt" from app_user where id = :id',
  // optional params
  params: {
    id: '1',
  },
});
// Generated query
// select id, username, createAt as "createdAt" from app_user where id = $1
// Params: ['1'];
// result = [{id: '1', username: 'admin', createdAt: 1617869191488}]

type executeQuery = <T>(query: DbQuery) => Promise<T[]>;
```

You may query a table. It can use named parameters and resolve the problem `camelCase` property name in the query result.

```typescript
const result = await pool.executeQuery({
  table: 'app_user',
  whereClause: 'createdAt >= :createdAt AND tsv @@ to_tsquery(:searchTerm)', // optional
  fields: ['id', 'username', 'createdAt'], // optional
  sortBy: ['username|ASC', 'createdAt|DESC'], // optional
  pageIndex: 2, // optional
  rowsPerPage: 5, // optional
  // optional
  params: {
    searchTerm: 'admin',
    createdAt: 1617869191488,
  },
});
// Generated query
// SELECT id as "id",username as "username",createdAt as "createdAt" FROM app_user WHERE createdAt >= $4 AND tsv @@ to_tsquery($3) ORDER BY username ASC, createdAt DESC LIMIT $1 OFFSET $2
// Params: [5, 10, 'admin', 1617869191488];
// result = [{id: 1, username: 'admin', createdAt: 1617869191488}]
```

Or use offset, limit options with the same result.

```typescript
const result = await pool.executeQuery({
  table: 'app_user',
  whereClause: 'createdAt >= :createdAt AND tsv @@ to_tsquery(:searchTerm)',
  fields: ['id', 'username', 'createdAt'],
  sortBy: ['username|ASC', 'createdAt|DESC'],
  limit: 5,
  offset: 10,
  params: {
    searchTerm: 'admin',
    createdAt: 1617869191488,
  },
});
// Generated query
// SELECT id as "id",username as "username",createdAt as "createdAt" FROM app_user WHERE createdAt >= $4 AND tsv @@ to_tsquery($3) ORDER BY username ASC, createdAt DESC LIMIT $1 OFFSET $2
// Params: [5, 10, 'admin', 1617869191488];
// result = [{id: 1, username: 'admin', createdAt: 1617869191488}]
```

### Count (Promise)

Count the number of records. Use the same params as **pool.executeQuery**. Properties _queryText_, _table_, _whereClause_ and _params_ are only included when using _table_.

```typescript
const count = await pool.count({
  queryText: 'select * from app_user where id = :id',
});
// Return the number of records
// Generated query
// SELECT COUNT(*) FROM (select * from app_user where id = $1) AS T
// Params: [1]
// count = 1

const count = await pool.count({
  table: 'app_user',
  whereClause: 'createdAt >= :createdAt AND tsv @@ to_tsquery(:searchTerm)', // optional
  fields: ['id', 'username', 'createdAt'],
  sortBy: ['username|ASC', 'createdAt|DESC'],
  pageIndex: 2,
  rowsPerPage: 5,
  params: {
    searchTerm: 'admin',
    createdAt: 1617869191488,
  },
});
// Return the number of records
// Generated query
// SELECT COUNT(*) FROM (SELECT * FROM app_user WHERE createdAt >= $2 AND tsv @@ to_tsquery($1)) AS T
// Params: ['admin', 1617869191488]
// count = 1

type count = (query: DbQuery) => Promise<number>;
```

### Get by id (Promise)

Get a record in a table using id.

```typescript
const entity = await pool.getById('app_user')(1, ['id', 'username']);
// Generated query
// SELECT id as "id",username as "username" FROM app_user WHERE id = $1
// Params: [1]
// entity = {
//   id: 1,
//   username: 'admin',
//   createdAt: 1617869191488
// }
const entity = await pool.getById('app_user')(1, ['userId', 'username', 'createdAt'], 'userId');
// in case the primary key column is named 'userId'
// Generated query
// SELECT userId as "userId",username as "username" FROM app_user WHERE userId = $1
// Params: [1]
// entity = {
//   userId: 1,
//   username: 'admin',
//   createdAt: 1617869191488
// }

type getById = (
  table: string,
) => <Record, Id>(id: Id, fields?: string[], idField?: string) => Promise<Record | undefined>;
```

### Create (Promise)

Create a new record in a specific table.

```typescript
const id = await pool.create('app_user')({username: 'thinh', displayName: 'Thinh Tran'});
// Generated query
// INSERT INTO app_user(username,displayName) VALUES($1,$2) RETURNING id
// Params: ['thinh', 'Thinh Tran']
// Return id from the new record

type create = (table: string) => <Record, Id>(record: Partial<Record>) => Promise<Id>;
```

### Update (Promise)

Create a new record in a specific table.

```typescript
await pool.update('app_user')(4, {username: 'thinh', displayName: 'Thinh Tran'});
// Generated query
// UPDATE app_user SET username=$2,displayName=$3 WHERE id = $1
// Params: [4, 'thinh', 'Thinh Tran']
// in case the primary key column is named 'userId'
await pool.update('app_user')(4, {username: 'thinh', displayName: 'Thinh Tran'}, 'userId');

type update = (table: string) => <Record, Id>(id: Id, updatedData: Partial<Record>, idField?: string) => Promise<void>;
```

### Remove (Promise)

Remove a record in a specific table by id.

```typescript
await pool.remove('app_user')(4);
// Generated query
// DELETE FROM app_user WHERE id = $1
// Params: [4]
// in case the primary key column is named 'userId'
await pool.remove('app_user')(4, 'userId');

type remove = (table: string) => <Record, Id>(id: Id, idField?: string) => Promise<void>;
```

### Execute transaction (Promise)

Run transaction. ExtendedPoolClient has similar extended functions like Pool. In case something wrong happens, the transaction is automatically rolled back.

```typescript
pool.executeTransaction(async (client) => {
  await client.update('app_user')(4, {username: 'thinh', displayName: 'Thinh Tran'});
  await client.update('app_user')(5, {username: 'test', displayName: 'Test'});
});

type executeTransaction = (transaction: (client: ExtendedPoolClient) => Promise<void>) => Promise<void>;
```

## With Observable

### Initialize pool (Observable)

Use this function instead of the original **pool.query** function.

```typescript
import {RxPool} from '@tqt/pg-extensions';

const pool = new RxPool({
  host: process.env.POSTGRES_HOST,
  port: +process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: Boolean(process.env.POSTGRES_SSL),
  // new option, optional
  log: (message: string | {queryText: string; params: unknown[] | undefined; duration: number}) => {
    console.log(message);
    // should log message or the query execution (only queries from extended functions are logged):
    // {
    //  queryText: "select * from app_user where id = $1",
    //  params: [1],
    //  duration: 100, --milliseconds
    // }
  },
});
pool.on('error', (err) => console.log(err));
pool.on('connect', () => console.log('Connected to database'));
```

### Query (Observable)

Use this function instead of the original **pool.query** function.

```typescript
pool
  .executeQuery({
    queryText: 'select id, username, createAt as "createdAt" from app_user where id = :id',
    // optional params
    params: {
      id: '1',
    },
  })
  .subscribe({
    next: (result) => {
      console.log(result);
    },
  });
// Generated query
// select id, username, createAt as "createdAt" from app_user where id = $1
// Params: ['1'];
// result = [{id: '1', username: 'admin', createdAt: 1617869191488}]

type executeQuery = <T>(query: DbQuery) => Promise<T[]>;
```

You may query a table. It can use named parameters and resolve the problem `camelCase` property name in the query result.

```typescript
pool
  .executeQuery({
    table: 'app_user',
    whereClause: 'createdAt >= :createdAt AND tsv @@ to_tsquery(:searchTerm)', // optional
    fields: ['id', 'username', 'createdAt'], // optional
    sortBy: ['username|ASC', 'createdAt|DESC'], // optional
    pageIndex: 2, // optional
    rowsPerPage: 5, // optional
    // optional
    params: {
      searchTerm: 'admin',
      createdAt: 1617869191488,
    },
  })
  .subscribe({
    next: (result) => {
      console.log(result);
    },
  });
// Generated query
// SELECT id as "id",username as "username",createdAt as "createdAt" FROM app_user WHERE createdAt >= $4 AND tsv @@ to_tsquery($3) ORDER BY username ASC, createdAt DESC LIMIT $1 OFFSET $2
// Params: [5, 10, 'admin', 1617869191488];
// result = [{id: 1, username: 'admin', createdAt: 1617869191488}]
```

Or use offset, limit options with the same result.

```typescript
pool
  .executeQuery({
    table: 'app_user',
    whereClause: 'createdAt >= :createdAt AND tsv @@ to_tsquery(:searchTerm)',
    fields: ['id', 'username', 'createdAt'],
    sortBy: ['username|ASC', 'createdAt|DESC'],
    limit: 5,
    offset: 10,
    params: {
      searchTerm: 'admin',
      createdAt: 1617869191488,
    },
  })
  .subscribe({
    next: (result) => {
      console.log(result);
    },
  });
// Generated query
// SELECT id as "id",username as "username",createdAt as "createdAt" FROM app_user WHERE createdAt >= $4 AND tsv @@ to_tsquery($3) ORDER BY username ASC, createdAt DESC LIMIT $1 OFFSET $2
// Params: [5, 10, 'admin', 1617869191488];
// result = [{id: 1, username: 'admin', createdAt: 1617869191488}]
```

### Count (Observable)

Count the number of records. Use the same params as **pool.executeQuery**. Only properties _queryText_, _table_, _whereClause_ and _params_ are included when using _table_.

```typescript
pool
  .count({
    queryText: 'select * from app_user where id = :id',
  })
  .subscribe({
    next: (count) => {
      console.log(count);
    },
  });
// Return the number of records
// Generated query
// SELECT COUNT(*) FROM (select * from app_user where id = $1) AS T
// Params: [1]
// count = 1

pool
  .count({
    table: 'app_user',
    whereClause: 'createdAt >= :createdAt AND tsv @@ to_tsquery(:searchTerm)', // optional
    fields: ['id', 'username', 'createdAt'],
    sortBy: ['username|ASC', 'createdAt|DESC'],
    pageIndex: 2,
    rowsPerPage: 5,
    params: {
      searchTerm: 'admin',
      createdAt: 1617869191488,
    },
  })
  .subscribe({
    next: (count) => {
      console.log(count);
    },
  });
// Return the number of records
// Generated query
// SELECT COUNT(*) FROM (SELECT * FROM app_user WHERE createdAt >= $2 AND tsv @@ to_tsquery($1)) AS T
// Params: ['admin', 1617869191488]
// count = 1

type count = (query: DbQuery) => Promise<number>;
```

### Get by id (Observable)

Get a record in a table using id.

```typescript
pool
  .getById('app_user')(1, ['id', 'username'])
  .subscribe({
    next: (entity) => {
      console.log(count);
    },
  });
// Generated query
// SELECT id as "id",username as "username" FROM app_user WHERE id = $1
// Params: [1]
// entity = {
//   id: 1,
//   username: 'admin',
//   createdAt: 1617869191488
// }
pool
  .getById('app_user')(1, ['userId', 'username', 'createdAt'], 'userId')
  .subscribe({
    next: (entity) => {
      console.log(count);
    },
  });
// in case the primary key column is named 'userId'
// Generated query
// SELECT userId as "userId",username as "username" FROM app_user WHERE userId = $1
// Params: [1]
// entity = {
//   userId: 1,
//   username: 'admin',
//   createdAt: 1617869191488
// }

type getById = (
  table: string,
) => <Record, Id>(id: Id, fields?: string[], idField?: string) => Promise<Record | undefined>;
```

### Create (Observable)

Create a new record in a specific table.

```typescript
pool
  .create('app_user')({username: 'thinh', displayName: 'Thinh Tran'})
  .subscribe({
    next: (id) => {
      console.log(id);
    },
  });
// Generated query
// INSERT INTO app_user(username,displayName) VALUES($1,$2) RETURNING id
// Params: ['thinh', 'Thinh Tran']
// Return id from the new record

type create = (table: string) => <Record, Id>(record: Partial<Record>) => Promise<Id>;
```

### Update (Observable)

Create a new record in a specific table.

```typescript
pool
  .update('app_user')(4, {username: 'thinh', displayName: 'Thinh Tran'})
  .subscribe({
    next: () => {
      console.log('done');
    },
  });
// Generated query
// UPDATE app_user SET username=$2,displayName=$3 WHERE id = $1
// Params: [4, 'thinh', 'Thinh Tran']
// in case the primary key column is named 'userId'
pool
  .update('app_user')(4, {username: 'thinh', displayName: 'Thinh Tran'}, 'userId')
  .subscribe({
    next: () => {
      console.log('done');
    },
  });

type update = (table: string) => <Record, Id>(id: Id, updatedData: Partial<Record>, idField?: string) => Promise<void>;
```

### Remove (Observable)

Remove a record in a specific table by id.

```typescript
pool
  .remove('app_user')(4)
  .subscribe({
    next: () => {
      console.log('done');
    },
  });
// Generated query
// DELETE FROM app_user WHERE id = $1
// Params: [4]
// in case the primary key column is named 'userId'
pool
  .remove('app_user')(4, 'userId')
  .subscribe({
    next: () => {
      console.log('done');
    },
  });

type remove = (table: string) => <Record, Id>(id: Id, idField?: string) => Promise<void>;
```

### Execute transaction (Observable)

Run transaction. ExtendedPoolClient has the similar extended functions like Pool. In case something wrong happens, the transaction will automatically be rolled back.

```typescript
pool.executeTransaction(async (client) =>
  of({}).pipe(
    switchMap(() => client.update('app_user')(4, {username: 'thinh', displayName: 'Thinh Tran'})),
    switchMap(() => client.update('app_user')(5, {username: 'test', displayName: 'Test'})),
    switchMap(() => {
      // do nothing
    }),
  ),
);

type executeTransaction = (transaction: (client: ExtendedPoolClient) => Promise<void>) => Promise<void>;
```
