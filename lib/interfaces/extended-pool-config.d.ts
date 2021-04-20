import type { PoolConfig } from 'pg';
import type { Logger } from './logger';
export interface ExtendedPoolConfig extends PoolConfig {
    log?: Logger;
}
