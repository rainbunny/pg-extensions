import type { PoolClient } from 'pg';
import type { RxExecutor } from './rx-executor';
/** common extended pool interface */
export declare type RxExtendedPoolClient = PoolClient & RxExecutor;
