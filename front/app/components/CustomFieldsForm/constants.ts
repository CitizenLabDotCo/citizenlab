/**
 * From this many options on, a dropdown gets a search input. Below it the
 * dropdown stays a plain picker, so short lists don't open a keyboard on
 * mobile.
 */
export const SEARCHABLE_OPTION_COUNT = 10;

/**
 * Past this many options an inline list of radio buttons is too long to scan,
 * so a single select is shown as a dropdown whatever `dropdown_layout` says.
 */
export const LIST_LAYOUT_MAX_OPTIONS = 20;
