import type { Executor, ExtendedPool, ExtendedPoolClient, Logger } from '@lib/interfaces';
export declare const implementExecutor: <Source extends ExtendedPoolClient | ExtendedPool>(executor: Source & Executor, log?: Logger) => Source;
