import { LabelProps } from 'recharts';
import { Percentage } from 'typings';

import { Payload } from '../BarChart/typings';
import { BaseProps, KeyOfType, Cell, BaseMapping } from '../typings';

export interface Props<Row> extends BaseProps<Row, Payload<Row>> {
  mapping: Mapping<Row>;
  pie?: Pie;
  annotations?: boolean | ((row: Row) => string);
  centerLabel?: LabelProps['content'];
}

export interface Mapping<Row> extends BaseMapping<Payload<Row>> {
  angle: KeyOfType<Row, number>;
  name?: KeyOfType<Row, string>;
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
    nameKey?: string;
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
