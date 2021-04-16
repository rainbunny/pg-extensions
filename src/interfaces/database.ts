import type {PoolClient} from 'pg';
import type {DbQuery} from './db-query';

/** common database interface */
export interface Database {
  /** Execute transaction.
   * Follow https://node-postgres.com/features/transactions
   */
  executeTransaction: (transaction: (client: PoolClient) => Promise<void>) => Promise<void>;
  /** Execute query */
  executeQuery: <T>(query: DbQuery) => Promise<T[]>;
  /** Count records in the query */
  count: (query: DbQuery) => Promise<number>;
  /** create new record */
  create: (table: string) => <Record, Id>(record: Partial<Record>) => Promise<Id>;
  /** update existing record */
  update: (table: string) => <Record, Id>(id: Id, updatedData: Partial<Record>, idField?: string) => Promise<void>;
  /** delete existing record */
  remove: (table: string) => <Id>(id: Id, idField?: string) => Promise<void>;
}
