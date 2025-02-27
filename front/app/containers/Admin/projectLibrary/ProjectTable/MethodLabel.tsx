import React from 'react';

import { StatusLabel, colors } from '@citizenlab/cl2-component-library';

import useProjectLibraryPhase from 'api/project_library_phases/useProjectLibraryPhase';

import { PARTICIPATION_METHOD_LABELS } from './utils';

interface Props {
  projectLibraryPhaseId: string;
}

const MethodLabel = ({ projectLibraryPhaseId }: Props) => {
  const { data: phase } = useProjectLibraryPhase(projectLibraryPhaseId);

  if (!phase) return null;

  return (
    <StatusLabel
      text={
        PARTICIPATION_METHOD_LABELS[phase.data.attributes.participation_method]
      }
      backgroundColor={colors.green700}
    />
  );
};

export default MethodLabel;
