import { IconNames } from '@citizenlab/cl2-component-library';

export type GanttItem = {
  id: string;
  title: string;
  start: string | null;
  end: string | null;
  folder?: string | null;
  highlightStartDate?: string | null;
  highlightEndDate?: string | null;
  icon?: IconNames;
  color?: string;
};

export type GanttChartProps = {
  chartTitle?: string;
  items: GanttItem[];
  startDate?: Date;
  endDate?: Date;
  renderItemTooltip?: (item: GanttItem) => React.ReactNode;
  showTodayLine?: boolean;
  onItemLabelClick?: (item: GanttItem) => void;
};
