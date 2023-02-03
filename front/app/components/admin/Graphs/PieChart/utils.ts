// typings
import { Mapping, Pie, PieConfig } from './typings';

// styling
import { categoricalColorScheme } from '../styling';

const DEFAULT_START_ANGLE = 90;
const DEFAULT_END_ANGLE = -270;

export const getPieConfig = <Row>(
  data: Row[],
  mapping: Mapping<Row>,
  pie?: Pie
) => {
  const { name, angle, fill, opacity } = mapping;
  const fillMapping = fill ?? categoricalColorScheme;

  const cells = data.map((row: Row, rowIndex: number) => ({
    fill: fillMapping({ row, rowIndex }),
    opacity: opacity && opacity({ row, rowIndex }),
  }));

  const nameKey = name as string | undefined;
  const dataKey = angle as string;

  const pieConfig: PieConfig = {
    props: {
      nameKey,
      dataKey,
      isAnimationActive: pie?.isAnimationActive,
      innerRadius: pie?.innerRadius,
      outerRadius: pie?.outerRadius ?? '100%',
      startAngle: pie?.startAngle ?? DEFAULT_START_ANGLE,
      endAngle: pie?.endAngle ?? DEFAULT_END_ANGLE,
    },
    cells,
  };

  return pieConfig;
};
