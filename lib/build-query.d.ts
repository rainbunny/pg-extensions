import type { DbQuery } from './interfaces';
/** build postgres sql query & params */
export declare const buildQuery: (query: DbQuery) => {
    queryText: string;
    params?: unknown[];
};
