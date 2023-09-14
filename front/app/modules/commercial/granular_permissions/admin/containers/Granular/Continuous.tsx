import React from 'react';
import styled from 'styled-components';

// components
import ActionsForm from './ActionsForm';

// hooks
import useProjectById from 'api/projects/useProjectById';
import useProjectPermissions from 'api/project_permissions/useProjectPermissions';
import useUpdateProjectPermission from 'api/project_permissions/useUpdateProjectPermission';

// utils
import {
  getMethodConfig,
  ParticipationMethodConfig,
} from 'utils/configs/participationMethodConfig';
import { isNilOrError } from 'utils/helperUtils';
import { HandlePermissionChangeProps } from './utils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  padding-bottom: 20px;
`;

interface Props {
  projectId: string;
}

const Continuous = ({ projectId }: Props) => {
  const { data: project } = useProjectById(projectId);
  const permissions = useProjectPermissions({
    projectId: project?.data.id,
  });
  const { mutate: updateProjectPermission } = useUpdateProjectPermission(
    project?.data.id
  );

  const handlePermissionChange = ({
    permission,
    permittedBy,
    groupIds,
    globalCustomFields,
  }: HandlePermissionChangeProps) => {
    updateProjectPermission({
      permissionId: permission.id,
      projectId,
      action: permission.attributes.action,
      permission: {
        permitted_by: permittedBy,
        group_ids: groupIds,
        global_custom_fields: globalCustomFields,
      },
    });
  };

  const config: ParticipationMethodConfig | null = !isNilOrError(project)
    ? getMethodConfig(project.data.attributes.participation_method)
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

export default Continuous;
