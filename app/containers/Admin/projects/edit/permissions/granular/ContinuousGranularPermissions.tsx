import React, { PureComponent } from 'react';
import styled from 'styled-components';

import ActionsForm from './ActionsForm';

import GetProjectPermissions, { GetProjectPermissionsChildProps } from 'resources/GetProjectPermissions';
import { isNilOrError } from 'utils/helperUtils';
import { IPermissionData, updateProjectPermission } from 'services/participationContextPermissions';
import { IProjectData } from 'services/projects';

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 20px 0;
  padding-bottom: 20px;
  justify-content: space-around;
`;

interface InputProps {
  project: IProjectData;
}

interface DataProps {
  permissions: GetProjectPermissionsChildProps;
}
interface Props extends InputProps, DataProps {}

class ContinuousGranularPermissions extends PureComponent<Props> {

  handlePermissionChange = (permission: IPermissionData, permittedBy: IPermissionData['attributes']['permitted_by'], groupIds: string[]) => {
    updateProjectPermission(
      permission.id,
      this.props.project.id,
      permission.attributes.action,
      { permitted_by: permittedBy, group_ids: groupIds }
    );
  }

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
    {(permissions) => <ContinuousGranularPermissions {...inputProps} permissions={permissions} />}
  </GetProjectPermissions>
);
