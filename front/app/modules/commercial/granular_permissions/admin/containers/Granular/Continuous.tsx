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
} from 'services/actionPermissions';

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
  projectId: string;
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
      this.props.projectId,
      permission.attributes.action,
      { permitted_by: permittedBy, group_ids: groupIds }
    );
  };

  render() {
    const { permissions, projectId } = this.props;

    if (!isNilOrError(permissions)) {
      return (
        <Container>
          <ActionsForm
            permissions={permissions}
            onChange={this.handlePermissionChange}
            postType="idea"
            projectId={projectId}
          />
        </Container>
      );
    }

    return null;
  }
}

export default (inputProps: InputProps) => (
  <GetProjectPermissions projectId={inputProps.projectId}>
    {(permissions) => <Continuous {...inputProps} permissions={permissions} />}
  </GetProjectPermissions>
);
