import { Percentage } from 'typings';
import { BaseProps, KeyOfType, Cell, BaseMapping } from '../typings';
import { Payload } from '../BarChart/typings';

// PROPS
export interface Props<Row> extends BaseProps<Row, Payload<Row>> {
  mapping: Mapping<Row>;
  pie?: Pie;
  annotations?: boolean | ((row: Row) => string);
  centerLabel?:
    | React.ReactElement
    | ((props: CenterLabelProps) => React.ReactElement);
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

interface CenterLabelProps {
  offset: number;
  viewBox: {
    cx: number;
    cy: number;
    startAngle: number;
    endAngle: number;
    innerRadius: number;
    outerRadius: number;
  };
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
