import React from 'react';

import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';

import GanttChart from 'components/UI/GanttChart';
import { GanttItem } from 'components/UI/GanttChart/types';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';
import ProjectTooltip from './ProjectTooltip';

interface Props {
  ganttItems: GanttItem[];
  projectsById: Record<string, ProjectMiniAdminData>;
}

const ProjectGanttChart = ({ ganttItems, projectsById }: Props) => {
  const { formatMessage } = useIntl();

  const onItemLabelClick = (ganttItem: GanttItem) => {
    clHistory.push(`/admin/projects/${ganttItem.id}`);
  };

  return (
    <GanttChart
      items={ganttItems}
      renderItemTooltip={(ganttItem) => (
        <ProjectTooltip ganttItem={ganttItem} projectsById={projectsById} />
      )}
      chartTitle={formatMessage(messages.project)}
      onItemLabelClick={onItemLabelClick}
    />
  );
};

export default ProjectGanttChart;
