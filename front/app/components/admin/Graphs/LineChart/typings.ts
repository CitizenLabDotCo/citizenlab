import {
  BaseProps,
  Margin,
  AxisProps,
  KeyOfType,
  // Cell,
  // BaseLabels,
  BaseMapping,
} from '../typings';

// PROPS
export interface Props<Row> extends BaseProps<Row, Payload<Row>> {
  mapping: Mapping<Row>;
  lines?: Lines;
  margin?: Margin;
  xaxis?: AxisProps;
  yaxis?: AxisProps;
}

interface Payload<Row> {
  row: Row;
  rowIndex: number;
  lineIndex: number;
}

export interface Mapping<Row> extends BaseMapping<Payload<Row>> {
  value: KeyOfType<Row, number>[];
  category?: KeyOfType<Row, string>;
}

interface Lines {
  names?: string[];
  isAnimationActive?: boolean;
}

