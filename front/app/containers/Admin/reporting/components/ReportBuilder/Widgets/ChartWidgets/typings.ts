import { Multiloc } from 'typings';

import { IResolution } from 'components/admin/ResolutionControl';

export interface ChartWidgetProps {
  title?: Multiloc;
  projectId: string | undefined;
  startAt?: string;
  endAt?: string | null;
}

export interface TimeSeriesWidgetProps extends ChartWidgetProps {
  resolution?: IResolution;
}
