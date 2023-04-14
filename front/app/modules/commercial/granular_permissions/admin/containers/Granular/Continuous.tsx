import React from 'react';
import styled from 'styled-components';

// components
import ActionsForm from './ActionsForm';

// hooks
import useProject from 'hooks/useProject';
import useProjectPermissions from 'api/project_permissions/useProjectPermissions';
import useUpdateProjectPermission from 'api/project_permissions/useUpdateProjectPermission';
import { IPCPermissionData } from 'api/phase_permissions/types';

// utils
import {
  getMethodConfig,
  ParticipationMethodConfig,
} from 'utils/participationMethodUtils';
import { isNilOrError } from 'utils/helperUtils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  padding-bottom: 20px;
`;

interface InputProps {
  projectId: string;
}

interface Props extends InputProps {}

const Continuous = ({ projectId }: Props) => {
  const project = useProject({ projectId });
  const permissions = useProjectPermissions({
    projectId: !isNilOrError(project) ? project.id : undefined,
  });
  const { mutate: updateProjectPermission } = useUpdateProjectPermission(
    project?.id
  );

  const handlePermissionChange = (
    permission: IPCPermissionData,
    permittedBy: IPCPermissionData['attributes']['permitted_by'],
    groupIds: string[]
  ) => {
    updateProjectPermission({
      permissionId: permission.id,
      projectId,
      action: permission.attributes.action,
      permission: { permitted_by: permittedBy, group_ids: groupIds },
    });
  };

  const config: ParticipationMethodConfig | null = !isNilOrError(project)
    ? getMethodConfig(project.attributes.participation_method)
    : null;

  if (!isNilOrError(permissions.data) && !isNilOrError(config)) {
    return (
      <Container>
        <ActionsForm
          permissions={permissions.data.data}
          onChange={handlePermissionChange}
          postType={config.postType}
          projectId={projectId}
        />
      </Container>
    );
  }

  return null;
};

export default (inputProps: InputProps) => <Continuous {...inputProps} />;
