# pg-extensions

Add more functions into the original pg package such as query builder, extended pool, extended client. It helps us to interact with Postgres easier then using an external ORM. The package is written in Typescript.

![Typed with TypeScript](https://flat.badgen.net/badge/icon/Typed?icon=typescript&label&labelColor=blue&color=555555)
![Eslint](https://badgen.net/badge/eslint/airbnb/ff5a5f?icon=airbnb)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
![GitHub](https://img.shields.io/github/license/rainbunny/pg-extensions)
![GitHub repo size](https://img.shields.io/github/repo-size/rainbunny/pg-extensions)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/rainbunny/pg-extensions)

**main:**
![CI-main](https://github.com/rainbunny/pg-extensions/workflows/CI-main/badge.svg)
[![codecov](https://codecov.io/gh/rainbunny/pg-extensions/branch/main/graph/badge.svg)](https://codecov.io/gh/rainbunny/pg-extensions)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=rainbunny_pg-extensions&metric=alert_status)](https://sonarcloud.io/dashboard?id=rainbunny_pg-extensions)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=rainbunny_pg-extensions&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=rainbunny_pg-extensions)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=rainbunny_pg-extensions&metric=security_rating)](https://sonarcloud.io/dashboard?id=rainbunny_pg-extensions)

**develop:**
![CI-develop](https://github.com/rainbunny/pg-extensions/workflows/CI-develop/badge.svg?branch=develop)
[![codecov](https://codecov.io/gh/rainbunny/pg-extensions/branch/develop/graph/badge.svg)](https://codecov.io/gh/rainbunny/pg-extensions/branch/develop)

## Installation

```bash
yarn add @rainbunny/pg-extensions
```

## How to use

Initialize the pool from this package instead of the original pool. It's an extended pool which has same functionalities as the original one with extended functions.

```typescript
import {Pool} from '@rainbunny/pg-extensions';

const writePool = new Pool({
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
writePool.on('error', (err) => console.log(err));
writePool.on('connect', () => console.log('Connected to write database'));
```

### pool.executeQuery

Use this function instead of the original **pool.query** function. It can use named parameters and resolve the problem of camelCase property name in the query result.

```typescript
pool.executeQuery({
  queryText: 'select * from app_user where createdAt >= :createdAt AND tsv @@ to_tsquery(:searchTerm)',
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
// SELECT id as "id",username as "username",createdAt as "createdAt" FROM (select * from app_user where createdAt >= $4 AND tsv @@ to_tsquery($3)) AS T ORDER BY username ASC, createdAt DESC LIMIT $1 OFFSET $2
// Params: [5, 10, 'admin', 1617869191488];
// Return
// [{id: 1, username: 'admin', createdAt: 1617869191488}]

type executeQuery = <T>(query: DbQuery) => Promise<T[]>;
```

Or use the normal offset, limit options with the same result.

```typescript
pool.executeQuery({
  queryText: 'select * from app_user where createdAt >= :createdAt AND tsv @@ to_tsquery(:searchTerm)',
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
// SELECT id as "id",username as "username",createdAt as "createdAt" FROM (select * from app_user where createdAt >= $4 AND tsv @@ to_tsquery($3)) AS T ORDER BY username ASC, createdAt DESC LIMIT $1 OFFSET $2
// Params: [5, 10, 'admin', 1617869191488];
// Return
// [{id: 1, username: 'admin', createdAt: 1617869191488}]
```

You may use a table name and a where clause

```typescript
pool.executeQuery({
  table: 'app_user',
  whereClause: 'createdAt >= :createdAt AND tsv @@ to_tsquery(:searchTerm)', // optional
  fields: ['id', 'username', 'createdAt'], // optional
  sortBy: ['username|ASC', 'createdAt|DESC'], // optional
  limit: 5, // optional
  offset: 10, // optional
  // optional
  params: {
    searchTerm: 'admin',
    createdAt: 1617869191488,
  },
});
// Generated query
// SELECT id as "id",username as "username",createdAt as "createdAt" FROM app_user WHERE createdAt >= $4 AND tsv @@ to_tsquery($3) ORDER BY username ASC, createdAt DESC LIMIT $1 OFFSET $2
// Params: [5, 10, 'admin', 1617869191488];
```

### pool.count

Count the number of records. Use the same params as **pool.executeQuery**. Only properties _queryText_, _table_, _whereClause_ and _params_ are used.

```typescript
pool.count({
  queryText: 'select * from app_user where id = :id',
  params: {id: 1},
  fields: ['id', 'username', 'createdAt'],
  sortBy: ['id|asc'],
  limit: 10,
  offset: 20,
});
// Return the number of records
// Generated query
// SELECT COUNT(*) FROM (SELECT * FROM (select * from app_user where id = $1) AS T) AS T
// Params: [1]

type count = (query: DbQuery) => Promise<number>;
```

Use this function instead of the original **pool.query** function. It can use named parameters and resolve the problem of camelCase property name in the query result.

### pool.getById

Get a record in a table using id.

```typescript
pool.getById('app_user')(1, ['id', 'username']);
// Generated query
// SELECT id as "id",username as "username" FROM app_user WHERE id = $1
// Params: [1]
// Return
// {
//   id: 1,
//   username: 'admin',
//   createdAt: 1617869191488
// }
pool.getById('app_user')(1, ['id', 'username', 'createdAt'], 'userId'); // in case the primary key column is named 'userId'

type getById = (
  table: string,
) => <Record, Id>(id: Id, fields?: string[], idField?: string) => Promise<Record | undefined>;
```

### pool.create

Create a new record in a specific table.

```typescript
pool.create('app_user')({username: 'thinh', displayName: 'Thinh Tran'});
// Generated query
// INSERT INTO app_user(username,displayName) VALUES($1,$2) RETURNING id
// Params: ['thinh', 'Thinh Tran']
// Return id from the new record

type create = (table: string) => <Record, Id>(record: Partial<Record>) => Promise<Id>;
```

### pool.update

Create a new record in a specific table.

```typescript
pool.update('app_user')(4, {username: 'thinh', displayName: 'Thinh Tran'});
// Generated query
// UPDATE app_user SET username=$2,displayName=$3 WHERE id = $1
// Params: [4, 'thinh', 'Thinh Tran']
// in case the primary key column is named 'userId'
pool.update('app_user')(4, {username: 'thinh', displayName: 'Thinh Tran'}, 'userId');

type update = (table: string) => <Record, Id>(id: Id, updatedData: Partial<Record>, idField?: string) => Promise<void>;
```

### pool.remove

Remove a record in a specific table by id.

```typescript
pool.remove('app_user')(4);
// Generated query
// DELETE FROM app_user WHERE id = $1
// Params: [4]
// in case the primary key column is named 'userId'
pool.remove('app_user')(4, 'userId');

type remove = (table: string) => <Record, Id>(id: Id, idField?: string) => Promise<void>;
```

### pool.executeTransaction

Run transaction. ExtendedPoolClient has the similar extended functions like Pool. In case something wrong happens, the transaction will automatically be rolled back.

```typescript
pool.executeTransaction(async (client) => {
  await client.update('app_user')(4, {username: 'thinh', displayName: 'Thinh Tran'});
  await client.update('app_user')(5, {username: 'test', displayName: 'Test'});
});

type executeTransaction = (transaction: (client: ExtendedPoolClient) => Promise<void>) => Promise<void>;
```

## How to publish a typescript package to npm

Follow [this article](https://itnext.io/step-by-step-building-and-publishing-an-npm-typescript-package-44fe7164964c).
