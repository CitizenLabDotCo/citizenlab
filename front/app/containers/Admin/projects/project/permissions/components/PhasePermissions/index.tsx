import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import useUpdatePhasePermission from 'api/phase_permissions/useUpdatePhasePermission';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import ActionsForm from 'components/admin/ActionsForm';
import { HandlePermissionChangeProps } from 'components/admin/ActionsForm/typings';

import { getMethodConfig } from 'utils/configs/participationMethodConfig';

import PhaseAccordion from './PhaseAccordion';

interface Props {
  project: IProjectData;
  phase: IPhaseData;
  phaseNumber?: number;
}

const PhasePermissions = ({ project, phase, phaseNumber }: Props) => {
  const { mutate: updatePhasePermission } = useUpdatePhasePermission();

  const handlePermissionChange = ({
    phaseId,
    permission,
    permittedBy,
    groupIds,
    globalCustomFields,
  }: HandlePermissionChangeProps) => {
    if (phaseId) {
      updatePhasePermission({
        permissionId: permission.id,
        phaseId,
        action: permission.attributes.action,
        permission: {
          permitted_by: permittedBy,
          group_ids: groupIds,
          global_custom_fields: globalCustomFields,
        },
      });
    }
  };

  const isSinglePhase = !phaseNumber;

  const phaseActionsForm = (
    <Box
      display="flex"
      flex={'1'}
      flexDirection="column"
      background={colors.white}
      minHeight="100px"
    >
      <ActionsFormWrapper
        phase={phase}
        onChange={handlePermissionChange}
        projectId={project.id}
      />
    </Box>
  );

  if (isSinglePhase) {
    return phaseActionsForm;
  } else {
    return (
      <PhaseAccordion
        phaseNumber={phaseNumber}
        phaseTitle={phase.attributes.title_multiloc}
      >
        {phaseActionsForm}
      </PhaseAccordion>
    );
  }
};

type ActionsFormWrapperProps = {
  phase: IPhaseData;
  onChange: ({
    permission,
    permittedBy,
    groupIds,
    globalCustomFields,
  }: HandlePermissionChangeProps) => void;
  projectId: string;
};

const ActionsFormWrapper = ({ phase, onChange }: ActionsFormWrapperProps) => {
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
        phaseId={phase.id}
      />
    </Box>
  );
};

export default PhasePermissions;
