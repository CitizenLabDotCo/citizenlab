import type { Paragraph, Table, TableOfContents } from 'docx';

// Word document element - can be any block-level element
export type WordElement = Paragraph | Table | TableOfContents;

// Generic converter function type
export type Converter<TInput, TOutput = WordElement[]> = (
  input: TInput
) => TOutput | Promise<TOutput>;

// Breakdown bar data item (used for topics, statuses, etc.)
export interface BreakdownItem {
  id: string;
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

// Chart data point for line/bar charts
export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

// Metric data for participation metrics
export interface MetricData {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
}

// Text content with optional formatting
export interface FormattedText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  color?: string;
  size?: number;
}

// Section configuration for document structure
export interface SectionConfig {
  title?: string;
  subtitle?: string;
  elements: WordElement[];
  pageBreakBefore?: boolean;
}
