export type GanttItem = {
  id: string;
  title: string;
  start: string | null;
  end: string | null;
  highlightStartDate?: string | null;
  highlightEndDate?: string | null;
};

export type GanttChartProps = {
  chartTitle?: string;
  items: GanttItem[];
  startDate?: Date;
  endDate?: Date;
  leftColumnWidth?: number;
  dayWidth?: number;
  monthWidth?: number;
  rowHeight?: number;
  timelineHeight?: number;
  onItemClick?: (item: GanttItem) => void;
  renderItemTooltip?: (item: GanttItem) => React.ReactNode;
  renderItemLabel?: (item: GanttItem) => React.ReactNode;
  getItemColor?: (item: GanttItem) => string;
  showTodayLine?: boolean;
  onItemLabelClick?: (item: GanttItem) => void;
};
