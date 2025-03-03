import React from 'react';

import { StatusLabel, colors } from '@citizenlab/cl2-component-library';

import useProjectLibraryPhase from 'api/project_library_phases/useProjectLibraryPhase';

import { useIntl } from 'utils/cl-intl';

import { PARTICIPATION_METHOD_LABELS } from '../constants';

interface Props {
  projectLibraryPhaseId: string;
}

const MethodLabel = ({ projectLibraryPhaseId }: Props) => {
  const { formatMessage } = useIntl();
  const { data: phase } = useProjectLibraryPhase(projectLibraryPhaseId);

  if (!phase) return null;

  return (
    <StatusLabel
      text={formatMessage(
        PARTICIPATION_METHOD_LABELS[phase.data.attributes.participation_method]
      )}
      backgroundColor={colors.green700}
      ml="4px"
      my="2px"
    />
  );
};

export default MethodLabel;
