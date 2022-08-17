// typings
import { Mapping, Pie, PieConfig } from './typings';

// styling
import { categoricalColorScheme } from '../styling';

const DEFAULT_START_ANGLE = 90;
const DEFAULT_END_ANGLE = -270;

export const getPieConfig = <Row>(
  data: Row[],
  mapping: Mapping<Row>,
  pie?: Pie,
  annotations?: boolean | ((row: Row) => string)
) => {
  const { name, angle, fill, opacity } = mapping;
  const fillMapping = fill ?? categoricalColorScheme;

  const cells = data.map((row, rowIndex) => ({
    fill: fillMapping(row, rowIndex),
    opacity: opacity && opacity(row, rowIndex),
  }));

  const nameKey = name as string;
  const dataKey = angle as string;

  const pieConfig: PieConfig = {
    props: {
      nameKey,
      dataKey,
      isAnimationActive: pie?.isAnimationActive,
      innerRadius: pie?.innerRadius,
      outerRadius: pie?.outerRadius,
      startAngle: pie?.startAngle ?? DEFAULT_START_ANGLE,
      endAngle: pie?.endAngle ?? DEFAULT_END_ANGLE,
      label: getAnnotations(annotations, nameKey, dataKey),
    },
    cells,
  };

  return pieConfig;
};

const getAnnotations = <Row>(
  annotations: undefined | boolean | ((row: Row) => string),
  nameKey: string,
  dataKey: string
) => {
  if (annotations === true) {
    return (row: Row) => `${row[nameKey]} : ${row[dataKey]}`;
  }

  if (typeof annotations === 'function') return annotations;

  return;
};
