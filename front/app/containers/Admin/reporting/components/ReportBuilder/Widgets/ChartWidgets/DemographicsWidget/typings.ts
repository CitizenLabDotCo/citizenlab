import { ChartWidgetProps } from '../typings';

export interface Props extends ChartWidgetProps {
  customFieldId?: string;
}

export type Data = [Record<string, number>];
