// styling
import { legacyColors, sizes } from '../styling';

// typings
import {
  Props,
  Mapping,
  Bars,
  BarConfig,
  Layout,
  LabelConfig,
} from './typings';

const FALLBACK_FILL = legacyColors.barFill;

export const getBarConfigs = <Row>(
  data: Row[],
  mapping: Mapping<Row>,
  bars?: Bars
) => {
  const { length, fill, opacity, cornerRadius } = mapping;

  const barConfigs: BarConfig[] = length.map((lengthColumn, barIndex) => {
    const cells = data.map((row, rowIndex) => {
      const payload = { row, rowIndex, barIndex };

      return {
        fill: (fill && fill(payload)) ?? FALLBACK_FILL,
        opacity: opacity && opacity(payload),
        radius: cornerRadius && cornerRadius(payload),
      };
    });

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

export const getLabelConfig = (
  labels: Props<any>['labels'],
  position: 'top' | 'right'
): LabelConfig => {
  const defaultLabelConfig = {
    fill: legacyColors.chartLabel,
    fontSize: sizes.chartLabel,
    position,
  };

  return typeof labels === 'object'
    ? { ...defaultLabelConfig, ...labels }
    : defaultLabelConfig;
};
