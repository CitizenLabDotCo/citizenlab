import React from 'react';

import GanttChart from 'components/UI/GanttChart';
import { GanttItem } from 'components/UI/GanttChart/types';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';
import ProjectTooltip from './ProjectTooltip';

const ProjectGanttChart = ({ projects }: { projects: GanttItem[] }) => {
  const { formatMessage } = useIntl();

  const onItemLabelClick = (project: GanttItem) => {
    clHistory.push(`/admin/projects/${project.id}`);
  };

  return (
    <GanttChart
      items={projects}
      renderItemTooltip={(ganttItem) => (
        <ProjectTooltip ganttItem={ganttItem} />
      )}
      chartTitle={formatMessage(messages.project)}
      onItemLabelClick={onItemLabelClick}
    />
  );
};

export default ProjectGanttChart;
