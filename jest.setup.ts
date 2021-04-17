jest.mock('pg', () => {
  const mPool = {
    connect: async () => ({
      query: jest.fn().mockReturnValue(Promise.resolve({})),
      release: jest.fn(),
    }),
  };
  return {Pool: jest.fn(() => mPool)};
});

export {};
