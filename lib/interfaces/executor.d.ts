import type { DbQuery } from './db-query';
/** Executor interface */
export interface Executor {
    /** Execute query */
    executeQuery: <T>(query: DbQuery) => Promise<T[]>;
    /** Count records in the query */
    count: (query: DbQuery) => Promise<number>;
    /** Get record by id */
    getById: (table: string) => <Record, Id>(id: Id, fields?: string[], idField?: string) => Promise<Record | undefined>;
    /** create new record */
    create: (table: string) => <Record, Id>(record: Partial<Record>) => Promise<Id>;
    /** update existing record */
    update: (table: string) => <Record, Id>(id: Id, updatedData: Partial<Record>, idField?: string) => Promise<void>;
    /** delete existing record */
    remove: (table: string) => <Id>(id: Id, idField?: string) => Promise<void>;
}
