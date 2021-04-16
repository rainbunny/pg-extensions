/** query object */
export interface DbQuery {
  /** example: SELECT id, name, description FROM book WHERE name = :name */
  queryText?: string;
  table?: string;
  whereClause?: string;
  /** example: ['name', 'createdAt'] */
  fields?: string[];
  /** example: ['name|DESC', 'createdAt|ASC'] */
  sortBy?: string[];
  /** example: {searchTerm: 'book me'} */
  params?: Record<string, unknown>;
  limit?: number;
  offset?: number;
  pageIndex?: number;
  rowsPerPage?: number;
}
