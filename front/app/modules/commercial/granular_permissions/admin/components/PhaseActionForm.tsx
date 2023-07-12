import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import React from 'react';
import { IPhaseData } from 'api/phases/types';
import { isNilOrError } from 'utils/helperUtils';
import ActionsForm from '../containers/Granular/ActionsForm';
import { Box } from '@citizenlab/cl2-component-library';
import { HandlePermissionChangeProps } from '../containers/Granular/utils';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';

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

export const PhaseActionForm = ({
  phase,
  onChange,
  projectId,
}: PhaseActionFormProps) => {
  const { data: permissions } = usePhasePermissions({ phaseId: phase.id });
  if (isNilOrError(permissions)) {
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
