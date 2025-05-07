import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import StatCard from '../../../../../../components/admin/GraphCards/StatCard';
import { StatCardProps } from '../../../../../../components/admin/GraphCards/StatCard/useStatCard/typings';

import { projectStatusConfig } from './config';

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
