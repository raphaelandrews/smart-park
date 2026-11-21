import {
  useListParkingSpaces,
  useListParkingSpaceTypes,
  useListPayments,
  useListTariffs,
  useListTickets,
  useListVehicles,
} from "@/api/generated";

/**
 * Lookup data is fetched with a large page because the API has no dedicated
 * "all active" or search endpoint. If `hasMore` is true, the collection exceeds this
 * size and the screen should use a paged combobox or "load more".
 */
export const LOOKUP_PAGE_SIZE = 200;

const lookupParams = { size: LOOKUP_PAGE_SIZE } as const;

export function useAllVehicles() {
  // Newest first so a vehicle just added in the driver area appears at the top.
  const query = useListVehicles({ size: LOOKUP_PAGE_SIZE, sort: ["createdAt,desc"] });
  const page = query.data?.data;
  const items = page?.content ?? [];

  return {
    query,
    items,
    total: page?.totalElements ?? 0,
    hasMore: (page?.totalElements ?? 0) > items.length,
  };
}

export function useAllParkingSpaces() {
  const query = useListParkingSpaces(lookupParams);
  const page = query.data?.data;
  const items = page?.content ?? [];

  return {
    query,
    items,
    total: page?.totalElements ?? 0,
    hasMore: (page?.totalElements ?? 0) > items.length,
  };
}

export function useAllParkingSpaceTypes() {
  const query = useListParkingSpaceTypes(lookupParams);
  const page = query.data?.data;
  const items = page?.content ?? [];

  return {
    query,
    items,
    total: page?.totalElements ?? 0,
    hasMore: (page?.totalElements ?? 0) > items.length,
  };
}

export function useAllTariffs() {
  const query = useListTariffs(lookupParams);
  const page = query.data?.data;
  const items = page?.content ?? [];

  return {
    query,
    items,
    total: page?.totalElements ?? 0,
    hasMore: (page?.totalElements ?? 0) > items.length,
  };
}

export function useAllTickets() {
  // Most recent sessions first so paged filtering still sees the open tickets.
  const query = useListTickets({ size: LOOKUP_PAGE_SIZE, sort: ["entryTime,desc"] });
  const page = query.data?.data;
  const items = page?.content ?? [];

  return {
    query,
    items,
    total: page?.totalElements ?? 0,
    hasMore: (page?.totalElements ?? 0) > items.length,
  };
}

export function useAllPayments() {
  const query = useListPayments({ size: LOOKUP_PAGE_SIZE, sort: ["paymentDateTime,desc"] });
  const page = query.data?.data;
  const items = page?.content ?? [];

  return {
    query,
    items,
    total: page?.totalElements ?? 0,
    hasMore: (page?.totalElements ?? 0) > items.length,
  };
}

/** Index a lookup collection by id for table joins. */
export function toLookupMap<T extends { id?: number }>(items: T[]): Map<number, T> {
  const map = new Map<number, T>();
  for (const item of items) {
    if (item.id !== undefined) {
      map.set(item.id, item);
    }
  }
  return map;
}
