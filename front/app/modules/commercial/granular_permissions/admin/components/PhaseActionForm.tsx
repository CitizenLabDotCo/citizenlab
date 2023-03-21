import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import React from 'react';
import { IPermissionData } from 'services/actionPermissions';
import { IPhaseData } from 'services/phases';
import { isNilOrError } from 'utils/helperUtils';
import ActionsForm from '../containers/Granular/ActionsForm';

type PhaseActionFormProps = {
  phase: IPhaseData;
  onChange: (
    permission: IPermissionData,
    permittedBy: IPermissionData['attributes']['permitted_by'],
    groupIds: string[]
  ) => void;
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
    <ActionsForm
      permissions={permissions.data}
      onChange={onChange}
      postType={postType}
      projectId={projectId}
    />
  );
};
