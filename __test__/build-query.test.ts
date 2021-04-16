import {buildQuery} from '@lib/build-query';

describe('buildQuery', () => {
  it('generates a normal query with query text', () => {
    const query = buildQuery({
      queryText: 'SELECT id, username FROM app_user',
    });
    expect(query).toMatchInlineSnapshot(`
      Object {
        "params": Array [],
        "queryText": "SELECT * FROM (SELECT id, username FROM app_user) AS T",
      }
    `);
  });

  it('generates a normal query with a table', () => {
    const query = buildQuery({
      table: 'app_user',
    });
    expect(query).toMatchInlineSnapshot(`
      Object {
        "params": Array [],
        "queryText": "SELECT * FROM app_user",
      }
    `);
  });

  it('generates a normal query with a table and WHERE clause', () => {
    const query = buildQuery({
      table: 'app_user',
      whereClause: "username = 'thinh'",
    });
    expect(query).toMatchInlineSnapshot(`
      Object {
        "params": Array [],
        "queryText": "SELECT * FROM app_user WHERE username = 'thinh'",
      }
    `);
  });

  it('generates a normal query with selected fields', () => {
    const query = buildQuery({
      table: 'app_user',
      fields: ['id', 'username', 'createdAt'],
    });
    expect(query).toMatchInlineSnapshot(`
      Object {
        "params": Array [],
        "queryText": "SELECT id as \\"id\\",username as \\"username\\",createdAt as \\"createdAt\\" FROM app_user",
      }
    `);
  });

  it('generates a normal query with offset', () => {
    const query = buildQuery({
      table: 'app_user',
      fields: ['id', 'username', 'createdAt'],
      limit: 10,
    });
    expect(query).toMatchInlineSnapshot(`
      Object {
        "params": Array [
          10,
        ],
        "queryText": "SELECT id as \\"id\\",username as \\"username\\",createdAt as \\"createdAt\\" FROM app_user LIMIT $1",
      }
    `);
  });

  it('generates a normal query with limit', () => {
    const query = buildQuery({
      table: 'app_user',
      fields: ['id', 'username', 'createdAt'],
      offset: 20,
    });
    expect(query).toMatchInlineSnapshot(`
      Object {
        "params": Array [
          20,
        ],
        "queryText": "SELECT id as \\"id\\",username as \\"username\\",createdAt as \\"createdAt\\" FROM app_user OFFSET $1",
      }
    `);
  });

  it('generates a normal query with offset & limit', () => {
    const query = buildQuery({
      table: 'app_user',
      fields: ['id', 'username', 'createdAt'],
      limit: 10,
      offset: 20,
    });
    expect(query).toMatchInlineSnapshot(`
      Object {
        "params": Array [
          10,
          20,
        ],
        "queryText": "SELECT id as \\"id\\",username as \\"username\\",createdAt as \\"createdAt\\" FROM app_user LIMIT $1 OFFSET $2",
      }
    `);
  });

  it('generates a normal query with offset pagination', () => {
    const query = buildQuery({
      table: 'app_user',
      fields: ['id', 'username', 'createdAt'],
      pageIndex: 2,
      rowsPerPage: 5,
    });
    expect(query).toMatchInlineSnapshot(`
      Object {
        "params": Array [
          5,
          10,
        ],
        "queryText": "SELECT id as \\"id\\",username as \\"username\\",createdAt as \\"createdAt\\" FROM app_user LIMIT $1 OFFSET $2",
      }
    `);
  });

  it('generates a normal query with params', () => {
    const query = buildQuery({
      table: 'app_user',
      whereClause: 'type = :type AND createdAt > :createdAt',
      fields: ['id', 'username', 'createdAt'],
      params: {
        type: 1,
        createdAt: 1617871400249,
        unusedParam: 0,
      },
    });
    expect(query).toMatchInlineSnapshot(`
      Object {
        "params": Array [
          1,
          1617871400249,
        ],
        "queryText": "SELECT id as \\"id\\",username as \\"username\\",createdAt as \\"createdAt\\" FROM app_user WHERE type = $1 AND createdAt > $2",
      }
    `);
  });

  it('generates a normal query with sort by', () => {
    const query = buildQuery({
      table: 'app_user',
      fields: ['id', 'username', 'createdAt'],
      sortBy: ['username|ASC', 'createdAt|DESC'],
    });
    expect(query).toMatchInlineSnapshot(`
      Object {
        "params": Array [],
        "queryText": "SELECT id as \\"id\\",username as \\"username\\",createdAt as \\"createdAt\\" FROM app_user ORDER BY username ASC, createdAt DESC",
      }
    `);
  });

  it('generates a full query with sort by', () => {
    const query = buildQuery({
      table: 'app_user',
      whereClause: 'createdAt >= :createdAt AND tsv @@ to_tsquery(:searchTerm)',
      fields: ['id', 'userusername', 'createdAt'],
      sortBy: ['userusername|ASC', 'createdAt|DESC'],
      pageIndex: 2,
      rowsPerPage: 5,
      params: {
        searchTerm: 'admin',
        createdAt: 1617869191488,
      },
    });
    expect(query).toMatchInlineSnapshot(`
      Object {
        "params": Array [
          5,
          10,
          "admin",
          1617869191488,
        ],
        "queryText": "SELECT id as \\"id\\",userusername as \\"userusername\\",createdAt as \\"createdAt\\" FROM app_user WHERE createdAt >= $4 AND tsv @@ to_tsquery($3) ORDER BY userusername ASC, createdAt DESC LIMIT $1 OFFSET $2",
      }
    `);
  });
});

export {};
