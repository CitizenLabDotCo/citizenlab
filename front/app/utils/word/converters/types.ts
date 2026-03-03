// Breakdown bar data item (used for topics, statuses, etc.)
export interface WordBreakdownItem {
  id?: string;
  name: string;
  count: number;
  color?: string;
  percentage?: number;
}

// Table cell content types
export type WordCellContent = string | number | null | undefined;

// Table row data
export interface WordTableRowData {
  cells: WordCellContent[];
  isHeader?: boolean;
}
