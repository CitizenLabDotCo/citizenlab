import { TimeSeriesWidgetProps } from '../typings';

import { parseStats } from './useVisitors/parse';

export interface Props extends Omit<TimeSeriesWidgetProps, 'projectId'> {}

export type Stats = ReturnType<typeof parseStats>;
