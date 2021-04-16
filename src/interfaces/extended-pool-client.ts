import type {PoolClient} from 'pg';
import type {Executor} from './executor';

/** common extended pool interface */
export type ExtendedPoolClient = PoolClient & Executor;
