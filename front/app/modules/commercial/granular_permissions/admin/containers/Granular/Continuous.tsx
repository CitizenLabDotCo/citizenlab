import React from 'react';
import styled from 'styled-components';

import ActionsForm from './ActionsForm';

import { isNilOrError } from 'utils/helperUtils';
import { IPermissionData } from 'services/actionPermissions';

import { fontSizes } from 'utils/styleUtils';
import useProject from 'hooks/useProject';
import {
  getMethodConfig,
  ParticipationMethodConfig,
} from 'utils/participationMethodUtils';
import useProjectPermissions from 'api/project_permissions/useProjectPermissions';
import useUpdateProjectPermission from 'api/project_permissions/useUpdateProjectPermission';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  padding-bottom: 20px;

  p {
    font-size: ${fontSizes.base}px;
    font-style: italic;
  }
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
    permission: IPermissionData,
    permittedBy: IPermissionData['attributes']['permitted_by'],
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
