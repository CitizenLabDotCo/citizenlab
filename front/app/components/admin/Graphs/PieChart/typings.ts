// typings
import { NilOrError } from 'utils/helperUtils';
import { KeyOfType, Channel, Cell } from '../typings';

// PROPS
export interface Props<Row> {
  width?: string | number;
  height?: string | number;
  data: Row[] | NilOrError;
  mapping: Mapping<Row>;
  pie?: Pie;
  centerLabel?: string;
  centerValue?: string;
  emptyContainerContent?: React.ReactNode;
}

export interface Mapping<Row> {
  name: KeyOfType<Row, string>;
  angle: KeyOfType<Row, number>;
  fill?: Channel<Row, string>;
  opacity?: Channel<Row, number>;
}

export interface Pie {
  isAnimationActive?: boolean;
  innerRadius?: number | string;
  outerRadius?: number | string;
}

// PARSED CONFIG
export interface PieConfig {
  props: {
    nameKey: string;
    dataKey: string;
    isAnimationActive?: boolean;
    innerRadius?: number | string;
    outerRadius?: number | string;
  };
  cells: Cell[];
}
