import type {Observable} from 'rxjs';
import type {ExtendedPoolConfig, DbQuery, RxExtendedPool, RxExtendedPoolClient} from '@lib/interfaces';

import {from, throwError, of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {Pool as PgPool} from 'pg';
import {implementRxExecutor} from './implement-rx-executor';

export class RxPool extends PgPool implements RxExtendedPool {
  log?: ExtendedPoolConfig['log'];

  executeQuery: <T>(query: DbQuery) => Observable<T[]>;

  count: (query: DbQuery) => Observable<number>;

  getById: (table: string) => <Record, Id>(id: Id, fields?: string[], idField?: string) => Observable<Record>;

  create: (table: string) => <Record, Id>(record: Partial<Record>) => Observable<Id>;

  update: (table: string) => <Record, Id>(id: Id, updatedData: Partial<Record>, idField?: string) => Observable<void>;

  remove: (table: string) => <Id>(id: Id, idField?: string) => Observable<void>;

  constructor(config?: ExtendedPoolConfig) {
    super(config);
    if (config) {
      const {log} = config;
      this.log = log;
    }
    implementRxExecutor(this, this.log);
  }

  /** Execute transaction.
   * Follow https://node-postgres.com/features/transactions
   */
  executeTransaction = (transaction: (client: RxExtendedPoolClient) => Observable<void>): Observable<void> =>
    from(this.connect()).pipe(
      map((client: RxExtendedPoolClient) => implementRxExecutor<RxExtendedPoolClient>(client, this.log)),
      switchMap((client) =>
        of({}).pipe(
          switchMap(() => from(client.query('BEGIN'))),
          switchMap(() => transaction(client)),
          switchMap(() => from(client.query('COMMIT').then(() => client.release()))),
          catchError((err) =>
            from(client.query('ROLLBACK').then(() => client.release())).pipe(switchMap(() => throwError(err))),
          ),
        ),
      ),
      map(() => {
        // do nothing
      }),
    );
}
