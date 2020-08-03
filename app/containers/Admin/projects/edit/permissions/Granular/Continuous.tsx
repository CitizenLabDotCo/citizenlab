import React, { PureComponent } from 'react';
import styled from 'styled-components';

import ActionsForm from './ActionsForm';

import GetProjectPermissions, {
  GetProjectPermissionsChildProps,
} from 'resources/GetProjectPermissions';
import { isNilOrError } from 'utils/helperUtils';
import {
  IPermissionData,
  updateProjectPermission,
} from 'services/participationContextPermissions';
import { IProjectData } from 'services/projects';

import { fontSizes } from 'utils/styleUtils';

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
  project: IProjectData;
}

interface DataProps {
  permissions: GetProjectPermissionsChildProps;
}
interface Props extends InputProps, DataProps {}

class Continuous extends PureComponent<Props> {
  handlePermissionChange = (
    permission: IPermissionData,
    permittedBy: IPermissionData['attributes']['permitted_by'],
    groupIds: string[]
  ) => {
    updateProjectPermission(
      permission.id,
      this.props.project.id,
      permission.attributes.action,
      { permitted_by: permittedBy, group_ids: groupIds }
    );
  };

  render() {
    const { permissions } = this.props;

    if (isNilOrError(permissions)) return null;

    return (
      <Container>
        <ActionsForm
          permissions={permissions}
          onChange={this.handlePermissionChange}
        />
      </Container>
    );
  }
}

export default (inputProps) => (
  <GetProjectPermissions projectId={inputProps.project.id}>
    {(permissions) => <Continuous {...inputProps} permissions={permissions} />}
  </GetProjectPermissions>
);
