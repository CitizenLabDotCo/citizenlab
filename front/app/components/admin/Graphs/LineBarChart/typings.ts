import {
  BaseProps,
  AxisProps,
  KeyOfType,
  // BaseLabels,
} from '../typings';

import { IResolution } from 'components/admin/ResolutionControl';

// PROPS
export interface Props<Row> extends BaseProps<Row, Payload> {
  mapping: Mapping<Row>;
  xaxis?: AxisProps;
  yaxis?: AxisProps;
  resolution?: IResolution;
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
