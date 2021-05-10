import type {DbQuery} from './interfaces';

const buildMainQuery = ({table, whereClause, fields}: DbQuery): string => {
  const fieldsClause = fields ? fields.map((field) => `${field} as "${field}"`).join(',') : '';
  return `SELECT ${fieldsClause || '*'} FROM ${table}${whereClause ? ` WHERE ${whereClause}` : ''}`;
};

const buildSortBy = ({sortBy}: DbQuery): string =>
  sortBy && sortBy.length > 0 ? ` ORDER BY ${sortBy.map((m) => m.replace('|', ' ')).join(', ')}` : '';

/** build postgres sql query & params */
export const buildQuery = (query: DbQuery): {queryText: string; params?: unknown[]} => {
  const {pageIndex, rowsPerPage, params} = query;
  let {limit, offset} = query;
  let finalQueryText: string;
  let paramInx = 1;
  const paramsArr = [];

  if (query.queryText) {
    finalQueryText = query.queryText;
  } else {
    finalQueryText = buildMainQuery(query) + buildSortBy(query);
    // add limit/offset
    if (typeof pageIndex === 'number' && typeof rowsPerPage === 'number') {
      limit = rowsPerPage;
      offset = rowsPerPage * pageIndex;
    }
    if (typeof limit === 'number') {
      finalQueryText += ` LIMIT $${paramInx}`;
      paramsArr.push(limit);
      paramInx += 1;
    }
    if (typeof offset === 'number') {
      finalQueryText += ` OFFSET $${paramInx}`;
      paramsArr.push(offset);
      paramInx += 1;
    }
  }

  // assign params
  if (params) {
    Object.keys(params).forEach((paramName) => {
      const splitQueryArr = finalQueryText.split(`:${paramName}`);
      if (splitQueryArr.length > 1) {
        let newQuery = splitQueryArr[0];
        splitQueryArr.forEach((part, index) => {
          if (index > 0) {
            newQuery += `$${paramInx}${part}`;
            paramsArr.push(params[paramName]);
            paramInx += 1;
          }
        });
        finalQueryText = newQuery;
      }
    });
  }

  return {
    queryText: finalQueryText,
    params: paramsArr,
  };
};
