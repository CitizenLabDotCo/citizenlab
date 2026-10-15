// The lists on every level load this many items at a time.
export const PAGE_SIZE = 50;

// Lists loaded whole, like every folder a user can manage, to choose from. A
// list's query key leaves out the page size, so each list asked for whole
// must use this one size to share its cache.
export const WHOLE_LIST_SIZE = 1000;
