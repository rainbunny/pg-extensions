import type {Pool} from 'pg';
// eslint-disable-next-line import/no-extraneous-dependencies
import mockdate from 'mockdate';

import {executeQuery} from '@lib/execute-query';

describe('executeQuery', () => {
  it('passes the correct data into src query', async () => {
    const mockExecutor = jest.fn();
    const mockResult = [1];
    const src = {
      query: async (execQueryText, execParams) => {
        mockExecutor(execQueryText, execParams);
        return mockResult;
      },
    };
    const queryText = 'SELECT id, username FROM app_user where id = $1';
    const params = ['1'];
    const result = await executeQuery((src as unknown) as Pool, queryText, params);
    expect(mockExecutor).toBeCalledWith(queryText, params);
    expect(result).toEqual(mockResult);
  });

  it('logs correctly', async () => {
    const log = jest.fn();
    const mockExecutor = jest.fn();
    const mockResult = [1];
    const src = {
      query: async (execQueryText, execParams) => {
        mockdate.set(1434319925276);
        mockExecutor(execQueryText, execParams);
        return mockResult;
      },
    };
    const queryText = 'SELECT id, username FROM app_user where id = $1';
    const params = ['1'];
    mockdate.set(1434319925275);
    await executeQuery((src as unknown) as Pool, queryText, params, log);
    expect(log).toBeCalledWith({queryText, params, duration: 1});
  });
});

export {};
