// STYLING
export interface Margin {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

// MAPPING
export interface Cell {
  fill: string;
  opacity?: number;
}

// AXES
export interface AxisProps {
  tickFormatter?: (value: any) => string;
  type?: 'number' | 'category';
  width?: number;
  tickLine?: boolean;
  hide?: boolean;
}

// UTILS
// https://stackoverflow.com/a/49752227
export type KeyOfType<T, V> = keyof {
  [P in keyof T as T[P] extends V ? P : never]: any;
};

export type Channel<Row, Output> = (row: Row, index: number) => Output;
