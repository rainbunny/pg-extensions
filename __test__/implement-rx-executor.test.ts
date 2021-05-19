import {implementRxExecutor} from '@lib/implement-rx-executor';
import {RxPool} from '@lib/rx-pool';
import type {RxExtendedPool} from '@lib/interfaces';

describe('implementRxExecutor', () => {
  let pool: RxExtendedPool;
  beforeEach(() => {
    pool = new RxPool();
    pool.query = jest.fn();
    implementRxExecutor(pool);
  });
  it('runs executeQuery correctly', (done) => {
    const queryText = 'select * from app_user where id = :id';
    const params = {id: 1};
    const mockResult = [{id: 1, name: 'name'}];
    (pool.query as unknown as jest.Mock).mockReturnValue(Promise.resolve({rows: mockResult}));
    pool
      .executeQuery({
        queryText,
        params,
      })
      .subscribe((result) => {
        expect(pool.query as unknown as jest.Mock).toBeCalledWith('select * from app_user where id = $1', [1]);
        expect(result).toEqual(mockResult);
        done();
      });
  });

  it('runs count correctly', async (done) => {
    const queryText = 'select * from app_user where id = :id';
    const params = {id: 1};
    const mockResult = [{count: 4}];
    (pool.query as unknown as jest.Mock).mockReturnValue(Promise.resolve({rows: mockResult}));
    pool
      .count({
        queryText,
        params,
      })
      .subscribe((result) => {
        expect(pool.query as unknown as jest.Mock).toBeCalledWith(
          'SELECT COUNT(*) FROM (select * from app_user where id = $1) AS T',
          [1],
        );
        expect(result).toEqual(4);
        done();
      });
  });

  it('runs getById and returns a record', (done) => {
    const mockResult = [{id: 4, username: 'user'}];
    (pool.query as unknown as jest.Mock).mockReturnValue(Promise.resolve({rows: mockResult}));
    pool
      .getById('app_user')('abc', ['id', 'username'])
      .subscribe((result) => {
        expect(pool.query as unknown as jest.Mock).toBeCalledWith(
          'SELECT id as "id",username as "username" FROM app_user WHERE id = $1',
          ['abc'],
        );
        expect(result).toEqual({id: 4, username: 'user'});
        done();
      });
  });

  it('runs getById and returns nothing', (done) => {
    (pool.query as unknown as jest.Mock).mockReturnValue(Promise.resolve({rows: []}));
    pool
      .getById('app_user')('abc', ['id', 'username'])
      .subscribe((result) => {
        expect(pool.query as unknown as jest.Mock).toBeCalledWith(
          'SELECT id as "id",username as "username" FROM app_user WHERE id = $1',
          ['abc'],
        );
        expect(result).toBeUndefined();
        done();
      });
  });

  it('runs getById with a specific id field', (done) => {
    const mockResult = [{id: 4, username: 'user'}];
    (pool.query as unknown as jest.Mock).mockReturnValue(Promise.resolve({rows: mockResult}));
    pool
      .getById('app_user')('abc', ['id', 'username'], 'userId')
      .subscribe((result) => {
        expect(pool.query as unknown as jest.Mock).toBeCalledWith(
          'SELECT id as "id",username as "username" FROM app_user WHERE userId = $1',
          ['abc'],
        );
        expect(result).toEqual({id: 4, username: 'user'});
        done();
      });
  });

  it('runs create and returns id', (done) => {
    const mockResult = [{id: 4}];
    (pool.query as unknown as jest.Mock).mockReturnValue(Promise.resolve({rows: mockResult}));
    pool
      .create('app_user')({username: 'thinh', displayName: 'Thinh Tran'})
      .subscribe((result) => {
        expect(pool.query as unknown as jest.Mock).toBeCalledWith(
          'INSERT INTO app_user(username,displayName) VALUES($1,$2) RETURNING id',
          ['thinh', 'Thinh Tran'],
        );
        expect(result).toEqual(4);
        done();
      });
  });

  it('runs update correctly', (done) => {
    const mockResult = [{id: 4}];
    (pool.query as unknown as jest.Mock).mockReturnValue(Promise.resolve({rows: mockResult}));
    pool
      .update('app_user')(4, {username: 'thinh', displayName: 'Thinh Tran'})
      .subscribe(() => {
        expect(pool.query as unknown as jest.Mock).toBeCalledWith(
          'UPDATE app_user SET username=$2,displayName=$3 WHERE id = $1',
          [4, 'thinh', 'Thinh Tran'],
        );
        done();
      });
  });

  it('runs update with a specific id field', async (done) => {
    const mockResult = [{id: 4}];
    (pool.query as unknown as jest.Mock).mockReturnValue(Promise.resolve({rows: mockResult}));
    pool
      .update('app_user')(4, {username: 'thinh', displayName: 'Thinh Tran'}, 'userId')
      .subscribe(() => {
        expect(pool.query as unknown as jest.Mock).toBeCalledWith(
          'UPDATE app_user SET username=$2,displayName=$3 WHERE userId = $1',
          [4, 'thinh', 'Thinh Tran'],
        );
        done();
      });
  });

  it('runs remove correctly', (done) => {
    const mockResult = [{id: 4}];
    (pool.query as unknown as jest.Mock).mockReturnValue(Promise.resolve({rows: mockResult}));
    pool
      .remove('app_user')(4)
      .subscribe(() => {
        expect(pool.query as unknown as jest.Mock).toBeCalledWith('DELETE FROM app_user WHERE id = $1', [4]);
        done();
      });
  });

  it('runs remove with a specific id field', (done) => {
    const mockResult = [{id: 4}];
    (pool.query as unknown as jest.Mock).mockReturnValue(Promise.resolve({rows: mockResult}));
    pool
      .remove('app_user')(4, 'userId')
      .subscribe(() => {
        expect(pool.query as unknown as jest.Mock).toBeCalledWith('DELETE FROM app_user WHERE userId = $1', [4]);
        done();
      });
  });
});

export {};
