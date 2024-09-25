import { Multiloc } from 'typings';

import { ProjectReportsPublicationStatus } from 'api/graph_data_units/requestTypes';

export interface Props {
  title?: Multiloc;
  startAt?: string;
  endAt?: string | null;
  publicationStatuses?: ProjectReportsPublicationStatus[];
}
