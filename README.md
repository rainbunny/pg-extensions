# pg-extensions

Add more functions into the original pg package such as query builder, extended pool, extended client. It helps us to interact with Postgres easier then using an external ORM. The package is written in Typescript.

![npm (scoped)](https://img.shields.io/npm/v/@rainbunny/pg-extensions)
![Typed with TypeScript](https://flat.badgen.net/badge/icon/Typed?icon=typescript&label&labelColor=blue&color=555555)
![Eslint](https://badgen.net/badge/eslint/airbnb/ff5a5f?icon=airbnb)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
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

## Promise style

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

### pool.executeQuery (Promise)

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

You may query a table. It can use named parameters and resolve the problem of camelCase property name in the query result.

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

[Full documentation](/pg-extensions-Promise.md)

## Observable style

```typescript
import {RxPool} from '@rainbunny/pg-extensions';

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

### pool.executeQuery (Observable)

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

You may query a table. It can use named parameters and resolve the problem of camelCase property name in the query result.

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

[Full documentation](/pg-extensions-Observable.md)
