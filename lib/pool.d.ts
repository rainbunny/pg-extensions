import { Pool as PgPool } from 'pg';
import type { ExtendedPoolConfig, DbQuery, ExtendedPool, ExtendedPoolClient } from './interfaces';
export declare class Pool extends PgPool implements ExtendedPool {
    private logQuery?;
    executeQuery: <T>(query: DbQuery) => Promise<T[]>;
    count: (query: DbQuery) => Promise<number>;
    getById: (table: string) => <Record, Id>(id: Id, fields?: string[], idField?: string) => Promise<Record>;
    create: (table: string) => <Record, Id>(record: Partial<Record>) => Promise<Id>;
    update: (table: string) => <Record, Id>(id: Id, updatedData: Partial<Record>, idField?: string) => Promise<void>;
    remove: (table: string) => <Id>(id: Id, idField?: string) => Promise<void>;
    constructor(config?: ExtendedPoolConfig);
    /** Execute transaction.
     * Follow https://node-postgres.com/features/transactions
     */
    executeTransaction: (transaction: (client: ExtendedPoolClient) => Promise<void>) => Promise<void>;
}
