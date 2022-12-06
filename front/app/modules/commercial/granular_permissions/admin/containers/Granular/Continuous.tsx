import React from 'react';
import GetProjectPermissions, {
  GetProjectPermissionsChildProps,
} from 'resources/GetProjectPermissions';
import useProject from 'hooks/useProject';
import {
  IPermissionData,
  updateProjectPermission,
} from 'services/actionPermissions';
import { isNilOrError } from 'utils/helperUtils';
import {
  getMethodConfig,
  ParticipationMethodConfig,
} from 'utils/participationMethodUtils';
import { fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';
import ActionsForm from './ActionsForm';

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

interface DataProps {
  permissions: GetProjectPermissionsChildProps;
}

interface Props extends InputProps, DataProps {}

const Continuous = ({ permissions, projectId }: Props) => {
  const project = useProject({ projectId });

  const handlePermissionChange = (
    permission: IPermissionData,
    permittedBy: IPermissionData['attributes']['permitted_by'],
    groupIds: string[]
  ) => {
    updateProjectPermission(
      permission.id,
      projectId,
      permission.attributes.action,
      { permitted_by: permittedBy, group_ids: groupIds }
    );
  };

  const config: ParticipationMethodConfig | null = !isNilOrError(project)
    ? getMethodConfig(project.attributes.participation_method)
    : null;

  if (!isNilOrError(permissions) && !isNilOrError(config)) {
    return (
      <Container>
        <ActionsForm
          permissions={permissions}
          onChange={handlePermissionChange}
          postType={config.postType}
          projectId={projectId}
        />
      </Container>
    );
  }

  return null;
};

export default (inputProps: InputProps) => (
  <GetProjectPermissions projectId={inputProps.projectId}>
    {(permissions) => <Continuous {...inputProps} permissions={permissions} />}
  </GetProjectPermissions>
);
