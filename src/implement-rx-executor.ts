/* eslint-disable no-param-reassign */
import {from} from 'rxjs';
import type {Observable} from 'rxjs';
import type {DbQuery, RxExecutor, Logger, RxExtendedPool, RxExtendedPoolClient} from '@lib/interfaces';
import {executeQuery} from './execute-query';
import {buildQuery} from './build-query';

export const implementRxExecutor = <Source extends RxExtendedPool | RxExtendedPoolClient>(
  executor: Source & RxExecutor,
  log?: Logger,
): Source => {
  /** Execute query */
  executor.executeQuery = <T>(query: DbQuery): Observable<T[]> => {
    const {queryText, params} = buildQuery(query);
    return from(executeQuery<T>(executor, queryText, params, log).then((res) => res.rows));
  };

  /** Count records in the query */
  executor.count = (query: DbQuery): Observable<number> => {
    const {queryText, params} = buildQuery({
      ...query,
      fields: [],
      pageIndex: undefined,
      rowsPerPage: undefined,
      sortBy: undefined,
      limit: undefined,
      offset: undefined,
    });
    const countQueryText = `SELECT COUNT(*) FROM (${queryText}) AS T`;
    return from(executeQuery<{count: number}>(executor, countQueryText, params, log).then((res) => res.rows[0].count));
  };

  /** Get record by id */
  executor.getById =
    (table: string) =>
    <Record, Id>(id: Id, fields?: string[], idField = 'id'): Observable<Record | undefined> => {
      const {queryText, params} = buildQuery({table, whereClause: `${idField} = :id`, fields, params: {id}});
      return from(
        executeQuery<Record>(executor, queryText, params).then((res) =>
          res.rows.length > 0 ? res.rows[0] : undefined,
        ),
      );
    };

  /** create new record */
  executor.create =
    (table: string) =>
    <Record, Id>(record: Partial<Record>): Observable<Id> => {
      const paramNames = Object.keys(record) as (keyof Record)[];
      const params = paramNames.map((name) => record[name]);
      const fieldsText = paramNames.join(',');
      const paramsText = Array.from(Array(paramNames.length), (_x, i) => `$${i + 1}`).join(',');
      const queryText = `INSERT INTO ${table}(${fieldsText}) VALUES(${paramsText}) RETURNING id`;
      return from(executeQuery<{id: Id}>(executor, queryText, params, log).then((res) => res.rows[0].id));
    };

  /** update existing record */
  executor.update =
    (table: string) =>
    <Record, Id>(id: Id, updatedData: Partial<Record>, idField = 'id'): Observable<void> => {
      const paramNames = Object.keys(updatedData) as (keyof Record)[];
      const params = paramNames.map((name) => updatedData[name]);
      const paramsText = paramNames.map((paramName, index) => `${paramName}=$${index + 2}`).join(',');
      const queryText = `UPDATE ${table} SET ${paramsText} WHERE ${idField} = $1`;
      return from(
        executeQuery(executor, queryText, [id, ...params], log).then(() => {
          // do nothing
        }),
      );
    };

  /** delete existing record */
  executor.remove =
    (table: string) =>
    <Id>(id: Id, idField = 'id'): Observable<void> => {
      const queryText = `DELETE FROM ${table} WHERE ${idField} = $1`;
      return from(
        executeQuery(executor, queryText, [id], log).then(() => {
          // do nothing
        }),
      );
    };

  return executor;
};
