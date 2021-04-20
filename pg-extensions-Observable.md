# pg-extensions (Observable)

Use pg-extensions with Observable style

## How to use

Initialize the pool from this package instead of the original pool. It's an extended pool which has same functionalities as the original one with extended functions.

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

type executeQuery = <T>(query: DbQuery) => Observable<T[]>;
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

type count = (query: DbQuery) => Observable<number>;
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
) => <Record, Id>(id: Id, fields?: string[], idField?: string) => Observable<Record | undefined>;
```

### pool.create

Create a new record in a specific table.

```typescript
pool.create('app_user')({username: 'thinh', displayName: 'Thinh Tran'});
// Generated query
// INSERT INTO app_user(username,displayName) VALUES($1,$2) RETURNING id
// Params: ['thinh', 'Thinh Tran']
// Return id from the new record

type create = (table: string) => <Record, Id>(record: Partial<Record>) => Observable<Id>;
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

type update = (
  table: string,
) => <Record, Id>(id: Id, updatedData: Partial<Record>, idField?: string) => Observable<void>;
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

type remove = (table: string) => <Record, Id>(id: Id, idField?: string) => Observable<void>;
```

### pool.executeTransaction

Run transaction. ExtendedPoolClient has the similar extended functions like Pool. In case something wrong happens, the transaction will automatically be rolled back.

```typescript
pool.executeTransaction((client) => of({}).pipe(
    switchMap(() => client.update('app_user')(4, {username: 'thinh', displayName: 'Thinh Tran'}),
    switchMap(() => client.update('app_user')(5, {username: 'test', displayName: 'Test'})),
    map(() => {
      // do nothing
    })
  );
));

type executeTransaction = (transaction: (client: ExtendedPoolClient) => Observable<void>) => Observable<void>;
```
