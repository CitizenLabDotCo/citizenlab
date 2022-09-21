import {
  BaseProps,
  AxisProps,
  KeyOfType,
  // BaseLabels,
} from '../typings';

// PROPS
export interface Props<Row> extends BaseProps<Row, Payload<Row>> {
  mapping: Mapping<Row>;
  lines?: Lines;
  xaxis?: AxisProps;
  yaxis?: AxisProps;
}

interface Payload<Row> {
  row: Row;
  rowIndex: number;
  lineIndex: number;
}

export interface Mapping<Row> {
  x: KeyOfType<Row, string>;
  y: KeyOfType<Row, number>[];
}

export interface Lines {
  names?: string[];
  isAnimationActive?: boolean;
  strokes?: string[];
  strokeWidths?: number[];
}

// PARSED CONFIGS
export interface LineConfig {
  props: {
    name?: string;
    dataKey: string;
    dot: false;
    activeDot: false;
    stroke: string;
    strokeWidth?: number;
    isAnimationActive?: boolean;
  };
}
