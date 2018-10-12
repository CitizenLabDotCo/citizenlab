import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { isEmpty } from 'lodash-es';

import { IPermissionData } from 'services/participationContextPermissions';

import ActionForm from './ActionForm';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const ActionPermissionWrapper = styled.div`
  flex-basis: 220px;
  flex-grow: 1;
  flex-shrink: 1;
  padding: 0 20px;
  min-width: 160px;
`;

interface Props {
  permissions: IPermissionData[];
  onChange: (permission: IPermissionData, permittedBy: IPermissionData['attributes']['permitted_by'], groupIds: string[]) => void;
}

export default class ActionsForm extends PureComponent<Props> {

  handlePermissionChange = (permission: IPermissionData) =>
    (permittedBy: IPermissionData['attributes']['permitted_by'], groupIds: string[]) => {
      this.props.onChange(permission, permittedBy, groupIds);
    }

  render() {
    const { permissions } = this.props;

    if (isEmpty(permissions)) {
      return <p><FormattedMessage {...messages.noActionsCanBeTaken} /></p>;
    } else {
      return permissions.map((permission) => (
        <ActionPermissionWrapper key={permission.id}>
          <h4><FormattedMessage {...messages[`permissionAction_${permission.attributes.action}`]} /></h4>
          <ActionForm
            permissionId={permission.id}
            permittedBy={permission.attributes.permitted_by}
            groupIds={permission.relationships.groups.data.map((p) => p.id)}
            onChange={this.handlePermissionChange(permission)}
          />
        </ActionPermissionWrapper>
      ));
    }
  }
}
