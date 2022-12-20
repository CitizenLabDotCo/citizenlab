import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import ProjectFilter from 'containers/Admin/dashboard/components/filters/ProjectFilter';

// typings
import { IOption } from 'typings';

type Props = {
  projectId?: string;
  phaseId?: string;
  onPhaseFilter: (filter: IOption) => void;
  onProjectFilter: (filter: IOption) => void;
};

const _ProjectFilter = ({ projectId, onProjectFilter }: Props) => {
  return (
    <Box width="100%" mb="20px">
      <ProjectFilter
        currentProjectFilter={projectId}
        width="100%"
        padding="11px"
        onProjectFilter={onProjectFilter}
      />
    </Box>
  );
};

export default _ProjectFilter;
