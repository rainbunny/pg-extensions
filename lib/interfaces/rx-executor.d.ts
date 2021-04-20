import type { Observable } from 'rxjs';
import type { DbQuery } from './db-query';
/** Executor interface */
export interface RxExecutor {
    /** Execute query */
    executeQuery: <T>(query: DbQuery) => Observable<T[]>;
    /** Count records in the query */
    count: (query: DbQuery) => Observable<number>;
    /** Get record by id */
    getById: (table: string) => <Record, Id>(id: Id, fields?: string[], idField?: string) => Observable<Record | undefined>;
    /** create new record */
    create: (table: string) => <Record, Id>(record: Partial<Record>) => Observable<Id>;
    /** update existing record */
    update: (table: string) => <Record, Id>(id: Id, updatedData: Partial<Record>, idField?: string) => Observable<void>;
    /** delete existing record */
    remove: (table: string) => <Id>(id: Id, idField?: string) => Observable<void>;
}
