import {RxPool} from '@lib/rx-pool';
import {map} from 'rxjs/operators';
import type {PoolClient} from 'pg';

describe('RxPool', () => {
  it('runs transaction correctly', (done) => {
    const queryText = 'SELECT id, username FROM app_user where id = :id';
    const params = {id: 1};
    const pool = new RxPool({});
    let mockClient: PoolClient;
    pool
      .executeTransaction((client) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        mockClient = client;
        return client
          .executeQuery({
            queryText,
            params,
          })
          .pipe(
            map(() => {
              // return void
            }),
          );
      })
      .subscribe(() => {
        expect(mockClient.query).toHaveBeenNthCalledWith(1, 'BEGIN');
        expect(mockClient.query).toHaveBeenNthCalledWith(2, 'SELECT id, username FROM app_user where id = $1', [1]);
        expect(mockClient.query).toHaveBeenNthCalledWith(3, 'COMMIT');
        expect(mockClient.query).toBeCalledTimes(3);
        expect(mockClient.release).toBeCalledTimes(1);
        done();
      });
  });

  it('reverts transaction when having error', (done) => {
    const queryText = 'SELECT id, username FROM app_user where id = :id';
    const params = {id: 1};
    const pool = new RxPool({});
    let mockClient: PoolClient;
    pool
      .executeTransaction((client) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        mockClient = client;
        return client
          .executeQuery({
            queryText,
            params,
          })
          .pipe(
            map(() => {
              throw new Error();
            }),
          );
      })
      .subscribe(
        () => {
          // do nothing
        },
        () => {
          expect(mockClient.query).toHaveBeenNthCalledWith(1, 'BEGIN');
          expect(mockClient.query).toHaveBeenNthCalledWith(2, 'SELECT id, username FROM app_user where id = $1', [1]);
          expect(mockClient.query).toHaveBeenNthCalledWith(3, 'ROLLBACK');
          expect(mockClient.query).toBeCalledTimes(3);
          expect(mockClient.release).toBeCalledTimes(1);
          done();
        },
      );
  });

  it('initializes ok with no config', async () => {
    const pool = new RxPool();
    expect(pool).not.toBeNull();
  });
});

export {};
