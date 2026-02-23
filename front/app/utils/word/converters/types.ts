// Breakdown bar data item (used for topics, statuses, etc.)
export interface BreakdownItem {
  id?: string;
  name: string;
  count: number;
  color?: string;
  percentage?: number;
}

// Table cell content types
export type CellContent = string | number | null | undefined;

// Table row data
export interface TableRowData {
  cells: CellContent[];
  isHeader?: boolean;
}
