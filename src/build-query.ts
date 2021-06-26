import type {DbQuery} from './interfaces';

interface QueryBuilder {
  query: DbQuery;
  finalQueryText: string;
  currentParamInx: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paramsArr: any[];
}

const buildMainQuery = ({table, whereClause, fields, queryText}: DbQuery): string => {
  const fieldsClause = fields ? fields.map((field) => `${field} as "${field}"`).join(',') : '';
  const whereQuery = whereClause ? ` WHERE ${whereClause}` : '';
  if (!fieldsClause && !whereClause && !table) {
    return queryText;
  }
  const tableFromQueryText = `(${queryText}) T`;
  return `SELECT ${fieldsClause || '*'} FROM ${table || tableFromQueryText}${whereQuery}`;
};

const buildSortBy = ({sortBy}: DbQuery): string =>
  sortBy && sortBy.length > 0 ? ` ORDER BY ${sortBy.map((m) => m.replace('|', ' ')).join(', ')}` : '';

const buildQueryWithoutParams = (queryBuilder: QueryBuilder): QueryBuilder => {
  const {query, paramsArr} = queryBuilder;
  const {pageIndex, rowsPerPage} = query;
  let {limit, offset} = query;
  let {currentParamInx} = queryBuilder;
  let finalQueryText: string;
  const areMultipleQueries = query.queryText && query.queryText.split(';').filter((q) => q).length > 1;

  if (areMultipleQueries) {
    finalQueryText = query.queryText;
  } else {
    finalQueryText = buildMainQuery(query) + buildSortBy(query);
    if (typeof pageIndex === 'number' && typeof rowsPerPage === 'number') {
      limit = rowsPerPage;
      offset = rowsPerPage * pageIndex;
    }
    if (typeof limit === 'number') {
      finalQueryText += ` LIMIT $${currentParamInx}`;
      paramsArr.push(limit);
      currentParamInx += 1;
    }
    if (typeof offset === 'number') {
      finalQueryText += ` OFFSET $${currentParamInx}`;
      paramsArr.push(offset);
      currentParamInx += 1;
    }
  }

  return {
    query,
    finalQueryText,
    currentParamInx,
    paramsArr,
  };
};

const addParams = (queryBuilder: QueryBuilder): QueryBuilder => {
  const {query, paramsArr} = queryBuilder;
  let {finalQueryText, currentParamInx} = queryBuilder;
  const {params} = query;
  if (params) {
    Object.keys(params).forEach((paramName) => {
      const splitQueryArr = finalQueryText.split(`:${paramName}`);
      if (splitQueryArr.length > 1) {
        let newQuery = splitQueryArr[0];
        splitQueryArr.forEach((part, index) => {
          if (index > 0) {
            newQuery += `$${currentParamInx}${part}`;
            paramsArr.push(params[paramName]);
            currentParamInx += 1;
          }
        });
        finalQueryText = newQuery;
      }
    });
  }
  return {
    query,
    finalQueryText,
    currentParamInx,
    paramsArr,
  };
};

/** build postgres sql query & params */
export const buildQuery = (query: DbQuery): {queryText: string; params?: unknown[]} => {
  const {finalQueryText, paramsArr} = addParams(
    buildQueryWithoutParams({query, finalQueryText: '', currentParamInx: 1, paramsArr: []}),
  );

  return {
    queryText: finalQueryText,
    params: paramsArr,
  };
};
