// App-wide settings that are not owned by one layer. Constants private to a
// single module stay in it (e.g. Merkl URL, timeout and cache TTLs in clients/merkl.ts).

export const DEFAULT_PAGE_SIZE = 20;
// Merkl serves at most 100 items per page and the client asks for pageSize + 1.
export const MAX_PAGE_SIZE = 50;
