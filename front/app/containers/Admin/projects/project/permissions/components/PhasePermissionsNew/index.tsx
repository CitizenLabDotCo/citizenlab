import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import useUpdatePhasePermission from 'api/phase_permissions/useUpdatePhasePermission';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import { HandlePermissionChangeProps } from 'components/admin/ActionsForm/typings';

import { getMethodConfig } from 'utils/configs/participationMethodConfig';

import PhaseAccordion from '../PhasePermissions/PhaseAccordion';

import ActionForms from './ActionForms';

interface Props {
  project: IProjectData;
  phase: IPhaseData;
  phaseNumber?: number;
}

const PhasePermissionsNew = ({ project, phase, phaseNumber }: Props) => {
  const { mutate: updatePhasePermission } = useUpdatePhasePermission();

  const handlePermissionChange = ({
    permission,
    permittedBy,
    groupIds,
    globalCustomFields,
  }: HandlePermissionChangeProps) => {
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
      <PhasePermissionsNewInner
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

type PhasePermissionsNewInnerProps = {
  phase: IPhaseData;
  onChange: ({
    permission,
    permittedBy,
    groupIds,
    globalCustomFields,
  }: HandlePermissionChangeProps) => void;
  projectId: string;
};

const PhasePermissionsNewInner = ({
  phase,
  onChange,
  projectId,
}: PhasePermissionsNewInnerProps) => {
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

export default PhasePermissionsNew;
