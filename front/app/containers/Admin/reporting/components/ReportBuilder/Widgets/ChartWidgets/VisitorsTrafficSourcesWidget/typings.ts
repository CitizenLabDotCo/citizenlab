import { ChartWidgetProps } from '../typings';

export type View = 'chart' | 'table';

export type Props = ChartWidgetProps & {
  view?: View;
};
