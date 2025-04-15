import {
  BaseProps,
  XAxisProps,
  YAxisProps,
  KeyOfType,
  // BaseLabels,
} from '../typings';

// PROPS
export interface Props<Row> extends BaseProps<Row, Payload> {
  mapping: Mapping<Row>;
  lines?: Lines;
  xaxis?: XAxisProps;
  yaxis?: YAxisProps;
  grid?: GridProps;
  showEmptyGraph?: boolean;
}

interface Payload {
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
  activeDot?: ActiveDot;
}

interface ActiveDot {
  r: number;
}

interface GridProps {
  horizontal?: boolean;
  vertical?: boolean;
}

// PARSED CONFIGS
export interface LineConfig {
  props: {
    name?: string;
    dataKey: string;
    dot: false;
    activeDot: false | ActiveDot;
    stroke: string;
    strokeWidth?: number;
    isAnimationActive?: boolean;
  };
}
