import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import { IPhaseData } from 'api/phases/types';

import { getMethodConfig } from 'utils/configs/participationMethodConfig';

import ActionsForm from '../containers/Granular/ActionsForm';
import { HandlePermissionChangeProps } from '../containers/Granular/utils';

type PhaseActionFormProps = {
  phase: IPhaseData;
  onChange: ({
    permission,
    permittedBy,
    groupIds,
    globalCustomFields,
  }: HandlePermissionChangeProps) => void;
  projectId: string;
};

const PhaseActionForm = ({
  phase,
  onChange,
  projectId,
}: PhaseActionFormProps) => {
  const { data: permissions } = usePhasePermissions({ phaseId: phase.id });
  if (!permissions) {
    return null;
  }

  const config = getMethodConfig(phase.attributes.participation_method);

  return (
    <Box mb="40px">
      <ActionsForm
        permissions={permissions.data}
        onChange={onChange}
        postType={config.postType}
        projectId={projectId}
        phaseId={phase.id}
      />
    </Box>
  );
};

export default PhaseActionForm;
