import { Mapping, Bars, ProgressBarConfig, TotalBarConfig } from './typings';
import { legacyColors, colors } from '../styling';

const FALLBACK_FILL = legacyColors.barFill;
const DEFAULT_BAR_BACKGROUND = colors.lightGrey;

export const getBarConfigs = <Row>(
  data: Row[],
  mapping: Mapping<Row>,
  bars?: Bars
) => {
  const { fill, opacity } = mapping;

  const cells = data.map((row, rowIndex) => ({
    fill: (fill && fill({ row, rowIndex })) ?? FALLBACK_FILL,
    opacity: opacity && opacity({ row, rowIndex }),
  }));

  const progressBarConfig: ProgressBarConfig = {
    props: {
      dataKey: mapping.length as string,
      isAnimationActive: bars?.isAnimationActive,
    },
    cells,
  };

  const totalBarConfig: TotalBarConfig = {
    props: {
      dataKey: mapping.total as string,
      fill: bars?.barBackground ?? DEFAULT_BAR_BACKGROUND,
      isAnimationActive: bars?.isAnimationActive,
    },
  };

  return { progressBarConfig, totalBarConfig };
};
