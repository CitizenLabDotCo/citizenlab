export interface LegendItem {
  icon: 'plain-line' | 'line' | 'rect' | 'circle';
  color: string;
  label: string;
}

export interface ItemPosition {
  left: number;
  top: number;
}

export interface GraphDimensions {
  width: number;
  height: number;
}

export interface LegendDimensions {
  width: number;
  height: number;
  itemPositions: ItemPosition[][];
}

export type Position = 'bottom-left' | 'bottom-center' | 'bottom-right';
