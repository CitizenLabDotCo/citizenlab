import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { isEmpty } from 'lodash-es';

import { IPermissionData } from 'services/participationContextPermissions';

import ActionForm from './ActionForm';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const ActionPermissionWrapper = styled.div`
  margin-bottom: 30px;

  &.last {
    margin-bottom: 0;
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
      return <p><FormattedMessage {...messages.noActionsCanBeTakenInThisProject} /></p>;
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
            action={permission.attributes.action}
            groupIds={permission.relationships.groups.data.map((p) => p.id)}
            onChange={this.handlePermissionChange(permission)}
          />
        </ActionPermissionWrapper>
      ));
    }
  }
}
