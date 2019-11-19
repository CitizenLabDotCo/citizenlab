import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { isEmpty } from 'lodash-es';

import { IPermissionData } from 'services/participationContextPermissions';

import ActionForm from './ActionForm';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const ActionPermissionWrapper = styled.div`
  flex: 1 1 0;
  width: calc((100% - 40px) * (1/3));
  margin-left: 20px;
  margin-right: 20px;

  &.first {
    margin-left: 0px;
  }

  &.last {
    margin-right: 0px;
  }
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
      return permissions.map((permission, index) => (
        <ActionPermissionWrapper
          key={permission.id}
          className={`${index === 0 ? 'first' : ''} ${index === permissions.length - 1 ? 'last' : ''}`}
        >
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
