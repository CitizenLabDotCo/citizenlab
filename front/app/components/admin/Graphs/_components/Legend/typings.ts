export interface LegendItem {
  icon: 'plain-line' | 'line' | 'rect' | 'circle';
  color: string;
  label: string;
  value?: number;
}

export interface ItemCoordinates {
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
  itemCoordinates: ItemCoordinates[];
}

export type Position =
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'right-center';
