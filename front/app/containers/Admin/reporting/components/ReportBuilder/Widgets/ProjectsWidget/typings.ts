import { Multiloc } from 'typings';

import { ProjectReportsPublicationStatus } from 'api/graph_data_units/requestTypes';
import { ProjectSortableParam } from 'api/projects_mini_admin/types';

export interface Props {
  title?: Multiloc;
  startAt?: string;
  endAt?: string | null;
  publicationStatuses?: ProjectReportsPublicationStatus[];
  sort?: ProjectSortableParam;
  excludedProjectIds?: string[];
  excludedFolderIds?: string[];
}
