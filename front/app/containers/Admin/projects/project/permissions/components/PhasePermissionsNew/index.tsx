import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';
import ActionsFormNew from './ActionsFormNew';
import { IPhaseData } from 'api/phases/types';
import { HandlePermissionChangeProps } from 'components/admin/ActionsForm/typings';
import { IProjectData } from 'api/projects/types';

interface Props {
  project: IProjectData;
  phase: IPhaseData;
}

const PhasePermissionsNew = ({ project, phase }: Props) => {
  const handlePermissionChange = () => {}; // TODO

  return (
    <Box>
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
