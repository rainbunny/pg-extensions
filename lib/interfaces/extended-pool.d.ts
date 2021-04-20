import type { Pool } from 'pg';
import type { Executor } from './executor';
import type { ExtendedPoolClient } from './extended-pool-client';
/** common extended pool interface */
export interface ExtendedPool extends Pool, Executor {
    /** Execute transaction.
     * Follow https://node-postgres.com/features/transactions
     */
    executeTransaction: (transaction: (client: ExtendedPoolClient) => Promise<void>) => Promise<void>;
}
