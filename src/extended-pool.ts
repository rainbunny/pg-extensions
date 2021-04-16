import {Pool, PoolClient} from 'pg';
import type {ExtendedPoolConfig, DbQuery, Database} from './interfaces';
import {buildQuery} from './build-query';
import {executeQuery} from './execute-query';

export class ExtendedPool extends Pool implements Database {
  log: ExtendedPoolConfig['log'];

  constructor(config?: ExtendedPoolConfig) {
    super(config);
    if (config) {
      const {log} = config;
      this.log = log;
    }
  }

  /** Execute transaction.
   * Follow https://node-postgres.com/features/transactions
   */
  executeTransaction = async (transaction: (client: PoolClient) => Promise<void>): Promise<void> => {
    const client = await this.connect();
    try {
      await client.query('BEGIN');
      await transaction(client);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  /** Execute query */
  executeQuery = async <T>(query: DbQuery): Promise<T[]> => {
    const {queryText, params} = buildQuery(query);
    return executeQuery<T>(this, queryText, params, this.log).then((res) => res.rows);
  };

  /** Count records in the query */
  count = async (query: DbQuery): Promise<number> => {
    const {queryText, params} = buildQuery({
      ...query,
      pageIndex: undefined,
      rowsPerPage: undefined,
      sortBy: undefined,
      limit: undefined,
      offset: undefined,
    });
    const countQueryText = `SELECT COUNT(*) FROM (${queryText}) AS T`;
    return executeQuery<{count: number}>(this, countQueryText, params, this.log).then((res) => res.rows[0].count);
  };

  /** create new record */
  create = (table: string) => async <Record, Id>(record: Partial<Record>): Promise<Id> => {
    const paramNames = Object.keys(record) as (keyof Record)[];
    const params = paramNames.map((name) => record[name]);
    const fieldsText = paramNames.join(',');
    const paramsText = Array.from(Array(paramNames.length), (_x, i) => `$${i + 1}`).join(',');
    const queryText = `INSERT INTO ${table}(${fieldsText}) VALUES(${paramsText}) RETURNING id`;
    return executeQuery<{id: never}>(this, queryText, params, this.log).then((res) => res.rows[0].id);
  };

  /** update existing record */
  update = (table: string) => async <Record, Id>(
    id: Id,
    updatedData: Partial<Record>,
    idField = 'id',
  ): Promise<void> => {
    const paramNames = Object.keys(updatedData) as (keyof Record)[];
    const params = paramNames.map((name) => updatedData[name]);
    const paramsText = paramNames.map((paramName, index) => `${paramName}=$${index + 2}`).join(',');
    const queryText = `UPDATE ${table} SET ${paramsText} WHERE ${idField} = $1`;
    await executeQuery<{id: Id}>(this, queryText, [id, ...params], this.log);
  };

  /** delete existing record */
  remove = (table: string) => async <Id>(id: Id, idField = 'id'): Promise<void> => {
    const queryText = `DELETE FROM ${table} WHERE ${idField} = $1`;
    await executeQuery(this, queryText, [id], this.log);
  };
}
