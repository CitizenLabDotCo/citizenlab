import { Mapping, Lines, LineConfig } from './typings';
import { colors } from '../styling';

const DEFAULT_STROKE = colors.categorical01;
const DEFAULT_STROKE_WIDTH = 2;

export const getLineConfigs = <Row>(mapping: Mapping<Row>, lines?: Lines) => {
  const { y } = mapping;

  const lineConfigs: LineConfig[] = y.map((yColumn, lineIndex) => ({
    props: {
      name: lines?.names?.[lineIndex],
      dataKey: yColumn as string,
      dot: false,
      activeDot: lines?.activeDot ?? false,
      stroke: lines?.strokes?.[lineIndex] ?? DEFAULT_STROKE,
      strokeWidth: lines?.strokeWidths?.[lineIndex] ?? DEFAULT_STROKE_WIDTH,
      isAnimationActive: lines?.isAnimationActive,
    },
  }));

  return lineConfigs;
};
