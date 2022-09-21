import { Mapping, Lines, LineConfig } from './typings';
import { colors } from '../styling';

const DEFAULT_STROKE = colors.categorical01;

export const getLineConfigs = <Row>(mapping: Mapping<Row>, lines?: Lines) => {
  const { y } = mapping;

  const lineConfigs: LineConfig[] = y.map((yColumn, lineIndex) => ({
    props: {
      name: lines?.names?.[lineIndex],
      dataKey: yColumn as string,
      dot: false,
      activeDot: false,
      stroke: lines?.strokes?.[lineIndex] ?? DEFAULT_STROKE,
      strokeWidth: lines?.strokeWidths?.[lineIndex],
      isAnimationActive: lines?.isAnimationActive,
    },
  }));

  return lineConfigs;
};
