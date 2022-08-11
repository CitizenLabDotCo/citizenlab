// styling
import { colors } from '../styling';

// typings
import { Mapping, BarSettings, Bar, Layout } from './typings';

const FALLBACKS = {
  fill: colors.barFill,
};

export const getBars = <Row>(
  data: Row[],
  mapping: Mapping<Row>,
  barSettings?: BarSettings
) => {
  const { category, length, fill, opacity } = mapping;

  const bars: Bar[] = length.map((lengthColumn, categoryIndex) => {
    const cells = data.map((row, rowIndex) => ({
      fill:
        (fill && colors[fill(row, rowIndex)[categoryIndex]]) ?? FALLBACKS.fill,
      opacity: opacity && opacity(row, rowIndex)[categoryIndex],
    }));

    return {
      name: category as string,
      dataKey: lengthColumn as string,
      cells,
      isAnimationActive: barSettings?.isAnimationActive,
      barSize: barSettings?.size,
    };
  });

  return bars;
};

// For some reason, in recharts a 'horizontal' bar chart
// actually means a 'vertical' bar chart. For our own API
// we use the correct terminology
export const getRechartsLayout = (layout: Layout) =>
  layout === 'vertical' ? 'horizontal' : 'vertical';
