export interface Item {
  icon: 'rect' | 'line' | 'plain-line',
  color: string;
  label: string;
}

interface ItemSize {
  left: number;
  width: number;
  height: number;
}

export interface LegendItemsDimensions {
  legendWidth: number;
  legendHeight: number;
  itemSizes: ItemSize[];
}

export interface GraphDimensions {
  graphWidth: number;
  graphHeight: number;
};

export type Position = 'bottom-left' | 'bottom-center' | 'bottom-right';
