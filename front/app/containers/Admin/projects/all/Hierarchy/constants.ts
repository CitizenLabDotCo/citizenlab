// The lists on every level load this many items at a time.
export const PAGE_SIZE = 50;

// Lists loaded whole, like every folder a user can manage, to choose from. A
// list's query key leaves out the page size, so each list asked for whole
// must use this one size to share its cache.
export const WHOLE_LIST_SIZE = 1000;

// Between the page's content and its edges.
export const PAGE_SIDE_PADDING = '32px';

// The level's toolbar: its buttons and the view switch.
export const TOOLBAR_HEIGHT = '28px';
