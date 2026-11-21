export interface SortState {
  field: string;
  direction: "asc" | "desc";
}

/** Converts the UI sort state into the Spring `sort=field,asc|desc` parameter. */
export function toSortParam(sort: SortState | undefined): string[] | undefined {
  return sort ? [`${sort.field},${sort.direction}`] : undefined;
}
