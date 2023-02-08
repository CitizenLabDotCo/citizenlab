import React from 'react';

import { StatCardProps } from '../StatCard/useStatCard/typings';
import StatCard from '../StatCard';
import { projectStatusConfig } from './config';
import { Box } from '@citizenlab/cl2-component-library';

const ProjectStatusCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: StatCardProps) => {
  return (
    <Box display="none">
      <StatCard
        config={projectStatusConfig}
        projectId={projectId}
        startAtMoment={startAtMoment}
        endAtMoment={endAtMoment}
        resolution={resolution}
        showExportMenu={false}
        alignItems="center"
      />
    </Box>
  );
};

export default ProjectStatusCard;
