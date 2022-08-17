import { Percentage } from 'typings';
import { BaseProps, KeyOfType, Cell } from '../typings';
import { Payload } from '../BarChart/typings';

// PROPS
export interface Props<Row> extends BaseProps<Row> {
  mapping: Mapping<Row>;
  pie?: Pie;
  annotations?: boolean | ((row: Row) => string);
  centerLabel?: React.ReactElement;
  onMouseOver?: (payload: Payload<Row>, event: React.MouseEvent) => void;
  onMouseOut?: (payload: Payload<Row>, event: React.MouseEvent) => void;
}

export interface Mapping<Row> {
  name: KeyOfType<Row, string>;
  angle: KeyOfType<Row, number>;
  fill?: (payload: Payload<Row>) => string;
  opacity?: (payload: Payload<Row>) => number;
}

export interface Pie {
  isAnimationActive?: boolean;
  innerRadius?: Percentage | number;
  outerRadius?: Percentage | number;
  startAngle?: number;
  endAngle?: number;
}

// PARSED CONFIG
export interface PieConfig {
  props: {
    nameKey: string;
    dataKey: string;
    isAnimationActive?: boolean;
    innerRadius?: number | string;
    outerRadius?: number | string;
    startAngle?: number;
    endAngle?: number;
    label?: any;
  };
  cells: Cell[];
}
