import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';

import { Localize } from 'hooks/useLocalize';

import { GanttItem } from 'components/UI/GanttChart/types';

import { getStatusColor } from '../_shared/utils';

// A project as a bar of the calendar: from its first phase to its last, with
// the current phases highlighted, coloured by its status.
const toGanttItem = (
  project: ProjectMiniAdminData,
  localize: Localize
): GanttItem => ({
  id: project.id,
  title: localize(project.attributes.title_multiloc),
  start: project.attributes.first_phase_start_date,
  end: project.attributes.last_phase_end_date,
  folder: localize(project.attributes.folder_title_multiloc),
  highlight: {
    start: project.attributes.active_phases_start_date,
    end: project.attributes.active_phases_end_date,
  },
  color: getStatusColor(
    project.attributes.publication_status,
    project.attributes.publication_status === 'draft' &&
      !!project.attributes.scheduled_at
  ),
  icon: project.attributes.folder_title_multiloc ? 'folder-solid' : undefined,
});

export default toGanttItem;
