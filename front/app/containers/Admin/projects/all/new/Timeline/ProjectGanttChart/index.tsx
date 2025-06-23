import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import GanttChart from 'components/UI/GanttChart';
import { GanttItem } from 'components/UI/GanttChart/types';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../messages';

export type GanttProject = GanttItem & {
  folder: string;
};

type ProjectGanttChartProps = {
  projects: GanttProject[];
};

const ProjectGanttChart = ({ projects }: ProjectGanttChartProps) => {
  const { formatMessage } = useIntl();

  const renderProjectTooltip = (project: GanttProject) => {
    return (
      <Box p="8px">
        <Box style={{ fontWeight: 'bold' }}>{project.title}</Box>
        {project.start && project.end ? (
          <Box mt="4px">
            {new Date(project.start).toLocaleDateString()} -{' '}
            {new Date(project.end).toLocaleDateString()}
          </Box>
        ) : (
          <Box mt="4px">{formatMessage(messages.noEndDay)}</Box>
        )}
      </Box>
    );
  };

  const onItemLabelClick = (project: GanttProject) => {
    clHistory.push(`/admin/projects/${project.id}`);
  };

  return (
    <GanttChart
      items={projects}
      renderItemTooltip={renderProjectTooltip}
      chartTitle={formatMessage(messages.project)}
      onItemLabelClick={onItemLabelClick}
    />
  );
};

export default ProjectGanttChart;
