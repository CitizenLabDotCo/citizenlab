// styling
import { legacyColors } from '../styling';

// typings
import { Mapping, Bars, BarConfig, Layout } from './typings';

const FALLBACKS = {
  fill: legacyColors.barFill,
};

export const getBarConfigs = <Row>(
  data: Row[],
  mapping: Mapping<Row>,
  bars?: Bars
) => {
  const { length, fill, opacity } = mapping;

  const barConfigs: BarConfig[] = length.map((lengthColumn, barIndex) => {
    const cells = data.map((row, rowIndex) => ({
      fill: (fill && fill(row, rowIndex)[barIndex]) ?? FALLBACKS.fill,
      opacity: opacity && opacity(row, rowIndex)[barIndex],
    }));

    return {
      props: {
        name: bars?.names?.[barIndex],
        dataKey: lengthColumn as string,
        isAnimationActive: bars?.isAnimationActive,
        barSize: bars?.size,
      },
      cells,
    };
  });

  return barConfigs;
};

// For some reason, in recharts a 'horizontal' bar chart
// actually means a 'vertical' bar chart. For our own API
// we use the correct terminology
export const getRechartsLayout = (layout: Layout) =>
  layout === 'vertical' ? 'horizontal' : 'vertical';
