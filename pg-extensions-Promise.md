# pg-extensions (Promise)

Use pg-extensions with Promise

## How to use

Initialize the pool from this package instead of the original pool. It's an extended pool which has same functionalities as the original one with extended functions.

```typescript
import {Pool} from '@rainbunny/pg-extensions';

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

### pool.executeQuery

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

Or use the normal offset, limit options with the same result.

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

### pool.count

Count the number of records. Use the same params as **pool.executeQuery**. Only properties _queryText_, _table_, _whereClause_ and _params_ are included when using _table_.

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

### pool.getById

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

### pool.create

Create a new record in a specific table.

```typescript
const id = await pool.create('app_user')({username: 'thinh', displayName: 'Thinh Tran'});
// Generated query
// INSERT INTO app_user(username,displayName) VALUES($1,$2) RETURNING id
// Params: ['thinh', 'Thinh Tran']
// Return id from the new record

type create = (table: string) => <Record, Id>(record: Partial<Record>) => Promise<Id>;
```

### pool.update

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

### pool.remove

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

### pool.executeTransaction

Run transaction. ExtendedPoolClient has the similar extended functions like Pool. In case something wrong happens, the transaction will automatically be rolled back.

```typescript
pool.executeTransaction(async (client) => {
  await client.update('app_user')(4, {username: 'thinh', displayName: 'Thinh Tran'});
  await client.update('app_user')(5, {username: 'test', displayName: 'Test'});
});

type executeTransaction = (transaction: (client: ExtendedPoolClient) => Promise<void>) => Promise<void>;
```
