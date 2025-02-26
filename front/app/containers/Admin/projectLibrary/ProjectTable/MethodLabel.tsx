import React from 'react';

import { StatusLabel, colors } from '@citizenlab/cl2-component-library';

import useProjectLibraryPhase from 'api/project_library_phases/useProjectLibraryPhase';

interface Props {
  projectLibraryPhaseId: string;
}

const MethodLabel = ({ projectLibraryPhaseId }: Props) => {
  const { data: phase } = useProjectLibraryPhase(projectLibraryPhaseId);
  console.log(phase);

  return <StatusLabel text={'Test'} backgroundColor={colors.green700} />;
};

export default MethodLabel;
