import { Margin } from './typings';
import { colors as mainColors } from 'utils/styleUtils';

export const DEFAULT_BAR_CHART_MARGIN: Margin = {
  top: 20,
  right: 30,
  left: 10,
  bottom: 5,
};

export const colors = {
  chartFill: mainColors.clIconAccent,
  chartLabel: mainColors.adminSecondaryTextColor,
  barHover: '#01a1b140',
  cartesianGrid: '#f5f5f5',
  newBarFill: '#073F80',
  barFillLighter: '#073f80b3',
  newLine: '#7FBBCA',
  pinkRed: '#C37281',
  lightBlue: '#5D99C6',
  lightGreen: '#B0CDC4',
  grey: '#C0C2CE',
};

export const sizes = {
  chartLabel: 13,
  bar: 20,
};

export const animation = {
  begin: 10,
  duration: 200,
};

export const piechartColors = [
  colors.pinkRed,
  colors.lightBlue,
  colors.lightGreen,
  colors.grey,
];
