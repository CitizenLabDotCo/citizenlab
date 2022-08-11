export interface DataRow {
  name: string;
  color: string;
  value: number;
}

export interface PieProps {
  data?: DataRow[] | null | Error;
  centerLabel?: string;
  centerValue?: string;
  width?: string | number;
  height?: string | number;
  emptyContainerContent?: React.ReactNode;
}
