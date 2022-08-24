// styling
import { legacyColors } from '../styling';

// typings
import { Mapping, BarConfig } from './typings';
import { Bars } from '../MultiBarChart/typings';

const FALLBACK_FILL = legacyColors.barFill;

export const getBarConfigs = <Row>(
  data: Row[],
  mapping: Mapping<Row>,
  bars?: Bars
) => {
  const { stack, fill, opacity } = mapping;

  const barConfigs: BarConfig[] = stack.map((stackColumn, stackIndex) => {
    const cells = data.map((row, rowIndex) => ({
      fill: (fill && fill({ row, rowIndex, stackIndex })) ?? FALLBACK_FILL,
      opacity: opacity && opacity({ row, rowIndex, stackIndex }),
    }));

    return {
      props: {
        name: bars?.names?.[stackIndex],
        dataKey: stackColumn as string,
        isAnimationActive: bars?.isAnimationActive,
        barSize: bars?.size,
      },
      cells,
    };
  });

  return barConfigs;
};
