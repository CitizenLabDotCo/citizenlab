import { Props as MultiBarChartProps } from '../MultiBarChart/typings';
import { KeyOfType, BaseMapping, Cell } from '../typings';

export interface Props<Row> extends Omit<MultiBarChartProps<Row>, 'mapping'> {
  mapping: Mapping<Row>;
}

interface Payload<Row> {
  row: Row;
  rowIndex: number;
  stackIndex: number;
}

export interface Mapping<Row> extends BaseMapping<Payload<Row>> {
  category: KeyOfType<Row, string>;
  stack: KeyOfType<Row, number>[];
}

// PARSED CONFIGS
export interface BarConfig {
  props: {
    name?: string;
    dataKey: string;
    isAnimationActive?: boolean;
    // TODO
  };
  cells: Cell[];
}

// interface LabelConfig {
//   // TODO
// };
