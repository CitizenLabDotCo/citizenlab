// DATA
export type DataRow = { name: string; [key: string]: any };
export type Data = DataRow[];

// STYLING
export interface Margin {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

// AXES
export interface AxisProps {
  tickFormatter?: (value: any) => string;
  type?: 'number' | 'category';
  width?: number;
  tickLine?: boolean;
  hide?: boolean;
}

// LABELS
export interface RenderLabelsProps {
  fill: string;
  fontSize: number;
  position: 'top' | 'right';
}

// TOOLTIP
export interface RenderTooltipProps {
  isAnimationActive: false;
  cursor: { fill: string };
}
