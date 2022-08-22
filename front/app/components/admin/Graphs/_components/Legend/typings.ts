
export interface Item {
  icon: 'rect' | 'line' | 'plain-line',
  fill: string;
  label: string;
}

interface ItemSize {
  left: number;
  width: number;
  height: number;
}

export interface LegendItemsSummary {
  legendWidth: number;
  legendHeight: number;
  itemSizes: ItemSize[];
}