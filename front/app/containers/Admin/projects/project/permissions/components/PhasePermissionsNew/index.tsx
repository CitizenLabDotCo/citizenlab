import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import { HandlePermissionChangeProps } from 'components/admin/ActionsForm/typings';

import { getMethodConfig } from 'utils/configs/participationMethodConfig';

import ActionsFormNew from './ActionsFormNew';

interface Props {
  project: IProjectData;
  phase: IPhaseData;
}

const PhasePermissionsNew = ({ project, phase }: Props) => {
  const handlePermissionChange = () => {}; // TODO

  return (
    <Box
      minHeight="100px"
      display="flex"
      flex={'1'}
      flexDirection="column"
      background={colors.white}
    >
      <ActionsFormNewWrapper
        phase={phase}
        onChange={handlePermissionChange}
        projectId={project.id}
      />
    </Box>
  );
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

const ActionsFormNewWrapper = ({
  phase,
  onChange,
  projectId,
}: ActionsFormWrapperProps) => {
  const { data: permissions } = usePhasePermissions({ phaseId: phase.id });

  if (!permissions) {
    return null;
  }

  const config = getMethodConfig(phase.attributes.participation_method);

  return (
    <Box mb="40px">
      <ActionsFormNew
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
