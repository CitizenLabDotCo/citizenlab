import { ProjectReportsPublicationStatus } from 'api/graph_data_units/requestTypes';

import { ChartWidgetProps } from '../typings';

export interface Props extends Omit<ChartWidgetProps, 'projectId'> {
  compareStartAt?: string;
  compareEndAt?: string;
  projectPublicationStatus?: ProjectReportsPublicationStatus;
}
