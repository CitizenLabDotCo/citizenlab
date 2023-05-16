import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import React from 'react';
import { IPhaseData } from 'api/phases/types';
import { isNilOrError } from 'utils/helperUtils';
import ActionsForm from '../containers/Granular/ActionsForm';
import { Box } from '@citizenlab/cl2-component-library';
import { HandlePermissionChangeProps } from '../containers/Granular/utils';

type PhaseActionFormProps = {
  phase: IPhaseData;
  onChange: ({
    permission,
    permittedBy,
    groupIds,
    globalCustomFields,
  }: HandlePermissionChangeProps) => void;
  postType: 'defaultInput' | 'nativeSurvey';
  projectId: string;
};

export const PhaseActionForm = ({
  phase,
  onChange,
  postType,
  projectId,
}: PhaseActionFormProps) => {
  const { data: permissions } = usePhasePermissions({ phaseId: phase.id });
  if (isNilOrError(permissions)) {
    return null;
  }

  return (
    <Box mb="40px">
      <ActionsForm
        permissions={permissions.data}
        onChange={onChange}
        postType={postType}
        projectId={projectId}
        phaseId={phase.id}
      />
    </Box>
  );
};
