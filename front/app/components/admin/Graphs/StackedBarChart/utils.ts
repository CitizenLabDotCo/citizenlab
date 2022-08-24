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
  const { stack, fill, opacity, cornerRadius } = mapping;

  const barConfigs: BarConfig[] = stack.map((stackColumn, stackIndex) => {
    const cells = data.map((row, rowIndex) => {
      const payload = { row, rowIndex, stackIndex };

      return {
        fill: (fill && fill(payload)) ?? FALLBACK_FILL,
        opacity: opacity && opacity(payload),
        radius: cornerRadius && cornerRadius(payload),
      };
    });

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
