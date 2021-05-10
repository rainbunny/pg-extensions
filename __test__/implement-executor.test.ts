import type {ExtendedPool} from '@lib/interfaces';
import {implementExecutor} from '@lib/implement-executor';
import {Pool} from '@lib/pool';

describe('implementExecutor', () => {
  let pool: ExtendedPool;
  beforeEach(() => {
    pool = new Pool();
    pool.query = jest.fn();
    implementExecutor(pool);
  });
  it('runs executeQuery correctly', async () => {
    const queryText = 'select * from app_user where id = :id';
    const params = {id: 1};
    const mockResult = [{id: 1, name: 'name'}];
    ((pool.query as unknown) as jest.Mock).mockReturnValue(Promise.resolve({rows: mockResult}));
    const result = await pool.executeQuery({
      queryText,
      params,
    });
    expect((pool.query as unknown) as jest.Mock).toBeCalledWith('select * from app_user where id = $1', [1]);
    expect(result).toEqual(mockResult);
  });

  it('runs count correctly', async () => {
    const queryText = 'select * from app_user where id = :id';
    const params = {id: 1};
    const mockResult = [{count: 4}];
    ((pool.query as unknown) as jest.Mock).mockReturnValue(Promise.resolve({rows: mockResult}));
    const result = await pool.count({
      queryText,
      params,
    });
    expect(
      (pool.query as unknown) as jest.Mock,
    ).toBeCalledWith('SELECT COUNT(*) FROM (select * from app_user where id = $1) AS T', [1]);
    expect(result).toEqual(4);
  });

  it('runs getById and returns a record', async () => {
    const mockResult = [{id: 4, username: 'user'}];
    ((pool.query as unknown) as jest.Mock).mockReturnValue(Promise.resolve({rows: mockResult}));
    const result = await pool.getById('app_user')('abc', ['id', 'username']);
    expect(
      (pool.query as unknown) as jest.Mock,
    ).toBeCalledWith('SELECT id as "id",username as "username" FROM app_user WHERE id = $1', ['abc']);
    expect(result).toEqual({id: 4, username: 'user'});
  });

  it('runs getById and returns nothing', async () => {
    ((pool.query as unknown) as jest.Mock).mockReturnValue(Promise.resolve({rows: []}));
    const result = await pool.getById('app_user')('abc', ['id', 'username']);
    expect(
      (pool.query as unknown) as jest.Mock,
    ).toBeCalledWith('SELECT id as "id",username as "username" FROM app_user WHERE id = $1', ['abc']);
    expect(result).toBeUndefined();
  });

  it('runs getById with a specific id field', async () => {
    const mockResult = [{id: 4, username: 'user'}];
    ((pool.query as unknown) as jest.Mock).mockReturnValue(Promise.resolve({rows: mockResult}));
    const result = await pool.getById('app_user')('abc', ['id', 'username'], 'userId');
    expect(
      (pool.query as unknown) as jest.Mock,
    ).toBeCalledWith('SELECT id as "id",username as "username" FROM app_user WHERE userId = $1', ['abc']);
    expect(result).toEqual({id: 4, username: 'user'});
  });

  it('runs create and returns id', async () => {
    const mockResult = [{id: 4}];
    ((pool.query as unknown) as jest.Mock).mockReturnValue(Promise.resolve({rows: mockResult}));
    const result = await pool.create('app_user')({username: 'thinh', displayName: 'Thinh Tran'});
    expect(
      (pool.query as unknown) as jest.Mock,
    ).toBeCalledWith('INSERT INTO app_user(username,displayName) VALUES($1,$2) RETURNING id', ['thinh', 'Thinh Tran']);
    expect(result).toEqual(4);
  });

  it('runs update correctly', async () => {
    const mockResult = [{id: 4}];
    ((pool.query as unknown) as jest.Mock).mockReturnValue(Promise.resolve({rows: mockResult}));
    await pool.update('app_user')(4, {username: 'thinh', displayName: 'Thinh Tran'});
    expect(
      (pool.query as unknown) as jest.Mock,
    ).toBeCalledWith('UPDATE app_user SET username=$2,displayName=$3 WHERE id = $1', [4, 'thinh', 'Thinh Tran']);
  });

  it('runs update with a specific id field', async () => {
    const mockResult = [{id: 4}];
    ((pool.query as unknown) as jest.Mock).mockReturnValue(Promise.resolve({rows: mockResult}));
    await pool.update('app_user')(4, {username: 'thinh', displayName: 'Thinh Tran'}, 'userId');
    expect(
      (pool.query as unknown) as jest.Mock,
    ).toBeCalledWith('UPDATE app_user SET username=$2,displayName=$3 WHERE userId = $1', [4, 'thinh', 'Thinh Tran']);
  });

  it('runs remove correctly', async () => {
    const mockResult = [{id: 4}];
    ((pool.query as unknown) as jest.Mock).mockReturnValue(Promise.resolve({rows: mockResult}));
    await pool.remove('app_user')(4);
    expect((pool.query as unknown) as jest.Mock).toBeCalledWith('DELETE FROM app_user WHERE id = $1', [4]);
  });

  it('runs remove with a specific id field', async () => {
    const mockResult = [{id: 4}];
    ((pool.query as unknown) as jest.Mock).mockReturnValue(Promise.resolve({rows: mockResult}));
    await pool.remove('app_user')(4, 'userId');
    expect((pool.query as unknown) as jest.Mock).toBeCalledWith('DELETE FROM app_user WHERE userId = $1', [4]);
  });
});

export {};
