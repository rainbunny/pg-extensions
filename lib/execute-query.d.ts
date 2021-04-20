import type { Pool, PoolClient, QueryResult } from 'pg';
import type { Logger } from '@lib/interfaces';
/** execute query and return result */
export declare const executeQuery: <T>(src: Pool | PoolClient, queryText: string, params?: unknown[], log?: Logger) => Promise<QueryResult<T>>;
