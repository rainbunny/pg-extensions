/* eslint-disable no-param-reassign */
import type {DbQuery, Executor, ExtendedPool, ExtendedPoolClient, Logger} from '@lib/interfaces';

import {executeQuery} from './execute-query';
import {buildQuery} from './build-query';

export const implementExecutor = <Source extends ExtendedPool | ExtendedPoolClient>(
  executor: Source & Executor,
  log?: Logger,
): Source => {
  /** Execute query */
  executor.executeQuery = async <T>(query: DbQuery): Promise<T[]> => {
    const {queryText, params} = buildQuery(query);
    return executeQuery<T>(executor, queryText, params, log).then((res) => res.rows);
  };

  /** Count records in the query */
  executor.count = async (query: DbQuery): Promise<number> => {
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
    return executeQuery<{count: number}>(executor, countQueryText, params, log).then((res) => res.rows[0].count);
  };

  /** Get record by id */
  executor.getById =
    (table: string) =>
    async <Record, Id>(id: Id, fields?: string[], idField = 'id'): Promise<Record | undefined> => {
      const {queryText, params} = buildQuery({table, whereClause: `${idField} = :id`, fields, params: {id}});
      return executeQuery<Record>(executor, queryText, params).then((res) =>
        res.rows.length > 0 ? res.rows[0] : undefined,
      );
    };

  /** create new record */
  executor.create =
    (table: string) =>
    async <Record, Id>(record: Partial<Record>): Promise<Id> => {
      const paramNames = Object.keys(record) as (keyof Record)[];
      const params = paramNames.map((name) => record[name]);
      const fieldsText = paramNames.join(',');
      const paramsText = Array.from(Array(paramNames.length), (_x, i) => `$${i + 1}`).join(',');
      const queryText = `INSERT INTO ${table}(${fieldsText}) VALUES(${paramsText}) RETURNING id`;
      return executeQuery<{id: never}>(executor, queryText, params, log).then((res) => res.rows[0].id);
    };

  /** update existing record */
  executor.update =
    (table: string) =>
    async <Record, Id>(id: Id, updatedData: Partial<Record>, idField = 'id'): Promise<void> => {
      const paramNames = Object.keys(updatedData) as (keyof Record)[];
      const params = paramNames.map((name) => updatedData[name]);
      const paramsText = paramNames.map((paramName, index) => `${paramName}=$${index + 2}`).join(',');
      const queryText = `UPDATE ${table} SET ${paramsText} WHERE ${idField} = $1`;
      await executeQuery<{id: Id}>(executor, queryText, [id, ...params], log);
    };

  /** delete existing record */
  executor.remove =
    (table: string) =>
    async <Id>(id: Id, idField = 'id'): Promise<void> => {
      const queryText = `DELETE FROM ${table} WHERE ${idField} = $1`;
      await executeQuery(executor, queryText, [id], log);
    };

  return executor;
};
