import type {Pool} from 'pg';
import type {Observable} from 'rxjs';
import type {RxExecutor} from './rx-executor';
import type {RxExtendedPoolClient} from './rx-pool-client';

/** common extended pool interface */
export interface RxExtendedPool extends Pool, RxExecutor {
  /** Execute transaction.
   * Follow https://node-postgres.com/features/transactions
   */
  executeTransaction: (transaction: (client: RxExtendedPoolClient) => Observable<void>) => Observable<void>;
}
