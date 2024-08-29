import { ChartWidgetProps } from '../typings';

export interface Props extends Omit<ChartWidgetProps, 'projectId'> {
  compareStartAt?: string;
  compareEndAt?: string;
}
