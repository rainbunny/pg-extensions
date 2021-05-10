import type {Pool, PoolClient, QueryResult} from 'pg';
import type {Logger} from './interfaces';

/** execute query and return result */
export const executeQuery = async <T>(
  src: Pool | PoolClient,
  queryText: string,
  params?: unknown[],
  log?: Logger,
): Promise<QueryResult<T>> => {
  const start = Date.now();
  return src.query<T>(queryText, params).finally(() => {
    const duration = Date.now() - start;
    if (log) {
      log({queryText, params, duration});
    }
  });
};
