import type { Observable } from 'rxjs';
import { Pool as PgPool } from 'pg';
import type { ExtendedPoolConfig, DbQuery, RxExtendedPool, RxExtendedPoolClient } from './interfaces';
export declare class RxPool extends PgPool implements RxExtendedPool {
    log?: ExtendedPoolConfig['log'];
    executeQuery: <T>(query: DbQuery) => Observable<T[]>;
    count: (query: DbQuery) => Observable<number>;
    getById: (table: string) => <Record, Id>(id: Id, fields?: string[], idField?: string) => Observable<Record>;
    create: (table: string) => <Record, Id>(record: Partial<Record>) => Observable<Id>;
    update: (table: string) => <Record, Id>(id: Id, updatedData: Partial<Record>, idField?: string) => Observable<void>;
    remove: (table: string) => <Id>(id: Id, idField?: string) => Observable<void>;
    constructor(config?: ExtendedPoolConfig);
    /** Execute transaction.
     * Follow https://node-postgres.com/features/transactions
     */
    executeTransaction: (transaction: (client: RxExtendedPoolClient) => Observable<void>) => Observable<void>;
}
