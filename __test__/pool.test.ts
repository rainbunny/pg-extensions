import {Pool} from '@lib/pool';
import type {PoolClient} from 'pg';

describe('Pool', () => {
  it('runs transaction correctly', async () => {
    const queryText = 'SELECT id, username FROM app_user where id = :id';
    const params = {id: 1};
    const pool = new Pool({});
    let mockClient: PoolClient;
    await pool.executeTransaction(async (client) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      mockClient = client;
      await client.executeQuery({
        queryText,
        params,
      });
    });
    expect(mockClient.query).toHaveBeenNthCalledWith(1, 'BEGIN');
    expect(mockClient.query).toHaveBeenNthCalledWith(2, 'SELECT id, username FROM app_user where id = $1', [1]);
    expect(mockClient.query).toHaveBeenNthCalledWith(3, 'COMMIT');
    expect(mockClient.query).toBeCalledTimes(3);
    expect(mockClient.release).toBeCalledTimes(1);
  });

  it('reverts transaction when having error', async () => {
    const queryText = 'SELECT id, username FROM app_user where id = :id';
    const params = {id: 1};
    const pool = new Pool({});
    let mockClient: PoolClient;
    await pool.executeTransaction(async (client) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      mockClient = client;
      await client.executeQuery({
        queryText,
        params,
      });
      throw new Error();
    });
    expect(mockClient.query).toHaveBeenNthCalledWith(1, 'BEGIN');
    expect(mockClient.query).toHaveBeenNthCalledWith(2, 'SELECT id, username FROM app_user where id = $1', [1]);
    expect(mockClient.query).toHaveBeenNthCalledWith(3, 'ROLLBACK');
    expect(mockClient.query).toBeCalledTimes(3);
    expect(mockClient.release).toBeCalledTimes(1);
  });

  it('initializes ok with no config', async () => {
    const pool = new Pool();
    expect(pool).not.toBeNull();
  });
});

export {};
