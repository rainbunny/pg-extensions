import type { RxExecutor, Logger, RxExtendedPool, RxExtendedPoolClient } from '@lib/interfaces';
export declare const implementRxExecutor: <Source extends RxExtendedPoolClient | RxExtendedPool>(executor: Source & RxExecutor, log?: Logger) => Source;
