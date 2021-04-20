import {Pool as PgPool} from 'pg';
import type {ExtendedPoolConfig, DbQuery, ExtendedPool, ExtendedPoolClient} from './interfaces';
import {implementExecutor} from './implement-executor';

export class Pool extends PgPool implements ExtendedPool {
  log?: ExtendedPoolConfig['log'];

  executeQuery: <T>(query: DbQuery) => Promise<T[]>;

  count: (query: DbQuery) => Promise<number>;

  getById: (table: string) => <Record, Id>(id: Id, fields?: string[], idField?: string) => Promise<Record>;

  create: (table: string) => <Record, Id>(record: Partial<Record>) => Promise<Id>;

  update: (table: string) => <Record, Id>(id: Id, updatedData: Partial<Record>, idField?: string) => Promise<void>;

  remove: (table: string) => <Id>(id: Id, idField?: string) => Promise<void>;

  constructor(config?: ExtendedPoolConfig) {
    super(config);
    if (config) {
      const {log} = config;
      this.log = log;
    }
    implementExecutor(this, this.log);
  }

  /** Execute transaction.
   * Follow https://node-postgres.com/features/transactions
   */
  executeTransaction = async (transaction: (client: ExtendedPoolClient) => Promise<void>): Promise<void> => {
    const client = await this.connect();
    const extendedClient = implementExecutor<ExtendedPoolClient>(client as ExtendedPoolClient, this.log);
    return extendedClient
      .query('BEGIN')
      .then(() => transaction(extendedClient))
      .then(() => extendedClient.query('COMMIT'))
      .catch((e) => extendedClient.query('ROLLBACK').then(() => e))
      .finally(() => extendedClient.release());
  };
}
