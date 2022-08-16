import { RefObject } from 'react';
import { NilOrError } from 'utils/helperUtils';
import { Percentage } from 'typings';
import { Margin, KeyOfType, Channel, Cell } from '../typings';

// PROPS
export interface Props<Row> {
  width?: Percentage | number;
  height?: Percentage | number;
  data: Row[] | NilOrError;
  mapping: Mapping<Row>;
  pie?: Pie;
  margin?: Margin;
  centerLabel?: React.ReactElement;
  emptyContainerContent?: React.ReactNode;
  innerRef?: RefObject<any>;
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
