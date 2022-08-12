// typings
import { Mapping, Pie, PieConfig } from './typings';

// styling
import { categoricalColorScheme } from '../styling';

export const getPieConfig = <Row>(
  data: Row[],
  mapping: Mapping<Row>,
  pie?: Pie
) => {
  const { name, angle, fill, opacity } = mapping;
  const fillMapping = fill ?? categoricalColorScheme;

  const cells = data.map((row, rowIndex) => ({
    fill: fillMapping(row, rowIndex),
    opacity: opacity && opacity(row, rowIndex),
  }));

  const pieConfig: PieConfig = {
    props: {
      nameKey: name as string,
      dataKey: angle as string,
      isAnimationActive: pie?.isAnimationActive,
      innerRadius: pie?.innerRadius,
      outerRadius: pie?.outerRadius,
    },
    cells,
  };

  return pieConfig;
};
