import { Multiloc } from 'typings';

import { ProjectReportsPublicationStatus } from 'api/graph_data_units/requestTypes';

import { IResolution } from 'components/admin/ResolutionControl';

export interface ChartWidgetProps {
  title?: Multiloc;
  ariaLabel?: Multiloc;
  description?: Multiloc;
  projectId?: string | undefined;
  startAt?: string;
  endAt?: string | null;
}

export interface ProjectPublicationStatusProps {
  projectPublicationStatus?: ProjectReportsPublicationStatus;
}

export interface TimeSeriesWidgetProps extends ChartWidgetProps {
  resolution?: IResolution;
}
