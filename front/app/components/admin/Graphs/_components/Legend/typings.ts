export interface Item {
  icon: 'plain-line' | 'line' | 'rect' | 'circle';
  color: string;
  label: string;
}

interface ItemPosition {
  left: number;
}

export interface GraphDimensions {
  width: number;
  height: number;
}

export interface LegendDimensions {
  width: number;
  height: number;
  itemPositions: ItemPosition[];
}

export type Position = 'bottom-left' | 'bottom-center' | 'bottom-right';
