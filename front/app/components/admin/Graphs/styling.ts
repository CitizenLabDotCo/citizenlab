import { Margin } from './typings';
import { colors as mainColors } from 'utils/styleUtils';

export const DEFAULT_BAR_CHART_MARGIN: Margin = {
  top: 20,
  right: 30,
  left: 10,
  bottom: 5,
};

// colors
export const legacyColors = {
  chartFill: mainColors.clIconAccent,
  chartLabel: mainColors.adminSecondaryTextColor,
  cartesianGrid: '#f5f5f5',
  barFill: '#073F80',
  barFillLighter: '#073f80b3',
  barHover: '#01a1b140',
  line: '#7FBBCA',
  pinkRed: '#C37281',
  lightBlue: '#5D99C6',
  lightGreen: '#B0CDC4',
  grey: '#C0C2CE',
};

export const colors = {
  chartLabel: mainColors.adminSecondaryTextColor,
  cartesianGrid: '#f5f5f5',
  blue: mainColors.adminTextColor,
  lightBlue: mainColors.clBlueLight,
  categorical01: '#2F478A',
  categorical02: '#4D85C6',
  categorical03: '#EE7041',
  categorical04: '#F3A675',
  categorical05: '#67D6C5',
  categorical06: '#3C8177',
  categorical07: '#5FC4E8',
  categorical08: '#64A0AF',
  categorical09: '#875A20',
  categorical10: '#A3A33A',
  categoricalOther: mainColors.tagHoverBackgroundColor,
};

const DEFAULT_CATEGORICAL_COLORS = [
  colors.categorical01,
  colors.categorical02,
  colors.categorical03,
  colors.categorical04,
  colors.categorical05,
  colors.categorical06,
  colors.categorical07,
  colors.categorical08,
  colors.categorical09,
  colors.categorical10,
];

export const categoricalColorScheme = (_, index: number) =>
  DEFAULT_CATEGORICAL_COLORS[index];

// other
export const sizes = {
  chartLabel: 13,
  bar: 20,
};

export const animation = {
  begin: 10,
  duration: 200,
};
