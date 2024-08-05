import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import { isGlobalPermissionAction } from 'api/permissions/utils';
import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import useUpdatePhasePermission from 'api/phase_permissions/useUpdatePhasePermission';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import { getMethodConfig } from 'utils/configs/participationMethodConfig';

import ActionForms from './ActionForms';
import PhaseAccordion from './PhaseAccordion';
import { HandlePermissionChangeProps } from './typings';

interface Props {
  project: IProjectData;
  phase: IPhaseData;
  phaseNumber?: number;
}

const PhasePermissions = ({ project, phase, phaseNumber }: Props) => {
  const { mutate: updatePhasePermission } = useUpdatePhasePermission();

  const handlePermissionChange = ({
    permission,
    permittedBy,
    groupIds,
    globalCustomFields,
  }: HandlePermissionChangeProps) => {
    if (isGlobalPermissionAction(permission.attributes.action)) {
      // Should not be possible
      return;
    }

    updatePhasePermission({
      permissionId: permission.id,
      phaseId: phase.id,
      action: permission.attributes.action,
      permission: {
        permitted_by: permittedBy,
        group_ids: groupIds,
        global_custom_fields: globalCustomFields,
      },
    });
  };

  const phaseMarkup = (
    <Box
      minHeight="100px"
      display="flex"
      flex={'1'}
      flexDirection="column"
      background={colors.white}
    >
      <PhasePermissionsInner
        phase={phase}
        onChange={handlePermissionChange}
        projectId={project.id}
      />
    </Box>
  );

  const showAccordion = phaseNumber !== undefined;

  if (showAccordion) {
    return (
      <PhaseAccordion
        phaseTitle={phase.attributes.title_multiloc}
        phaseNumber={phaseNumber}
      >
        {phaseMarkup}
      </PhaseAccordion>
    );
  }

  return phaseMarkup;
};

type PhasePermissionsInnerProps = {
  phase: IPhaseData;
  onChange: ({
    permission,
    permittedBy,
    groupIds,
    globalCustomFields,
  }: HandlePermissionChangeProps) => void;
  projectId: string;
};

const PhasePermissionsInner = ({
  phase,
  onChange,
  projectId,
}: PhasePermissionsInnerProps) => {
  const { data: permissions } = usePhasePermissions({ phaseId: phase.id });

  if (!permissions) {
    return null;
  }

  const config = getMethodConfig(phase.attributes.participation_method);

  return (
    <Box mb="40px">
      <ActionForms
        permissions={permissions.data}
        onChange={onChange}
        postType={config.postType}
        projectId={projectId}
        phaseId={phase.id}
      />
    </Box>
  );
};

export default PhasePermissions;
