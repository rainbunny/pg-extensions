import type {DbQuery} from './interfaces';

/** build postgres sql query & params */
export const buildQuery = (query: DbQuery): {queryText: string; params?: unknown[]} => {
  const {fields, queryText, table, whereClause, sortBy, pageIndex, rowsPerPage, params} = query;
  let {limit, offset} = query;
  const fieldsClause = fields ? fields.map((field) => `${field} as "${field}"`).join(',') : '';
  let finalQueryText: string;
  let paramInx = 1;
  const paramsArr = [];

  // build query
  if (!queryText) {
    finalQueryText = `SELECT ${fieldsClause || '*'} FROM ${table}`;
    finalQueryText += whereClause ? ` WHERE ${whereClause}` : '';
  } else {
    finalQueryText = `SELECT ${fieldsClause || '*'} FROM (${queryText}) AS T`;
  }

  // add sort by
  if (sortBy && sortBy.length > 0) {
    finalQueryText += ` ORDER BY ${sortBy.map((m) => m.replace('|', ' ')).join(', ')}`;
  }

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
