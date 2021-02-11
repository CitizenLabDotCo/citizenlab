import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';

import localize, { InjectedLocalized } from 'utils/localize';
import GetGroups, { GetGroupsChildProps } from 'resources/GetGroups';

import MultipleSelect from 'components/UI/MultipleSelect';
import { Radio } from 'cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import permissionsMessages from 'containers/Admin/projects/edit/permissions/messages';
import { IPermissionData } from 'services/actionPermissions';

const StyledFieldset = styled.fieldset`
  border: none;
  padding: 0;
`;

const StyledMultipleSelect = styled(MultipleSelect)`
  width: 300px;
`;

interface InputProps {
  permissionData: IPermissionData;
  groupIds?: string[];
  onChange: (
    permittedBy: IPermissionData['attributes']['permitted_by'],
    groupIds: Props['groupIds']
  ) => void;
}

interface DataProps {
  groups: GetGroupsChildProps;
}

export interface Props extends InputProps, DataProps, InjectedLocalized {}

class ActionForm extends PureComponent<Props> {
  groupsOptions = () => {
    const {
      groups: { groupsList },
    } = this.props;
    if (isNilOrError(groupsList)) {
      return [];
    } else {
      return groupsList.map((group) => ({
        label: this.props.localize(group.attributes.title_multiloc),
        value: group.id,
      }));
    }
  };

  handlePermittedByUpdate = (
    value: IPermissionData['attributes']['permitted_by']
  ) => () => {
    const { groupIds, onChange } = this.props;
    onChange(value, groupIds);
  };

  handleGroupIdsUpdate = (options: { value: string }[]) => {
    const { permissionData, onChange } = this.props;
    onChange(
      permissionData.attributes.permitted_by,
      options.map((o) => o.value)
    );
  };

  render() {
    const { permissionData, groupIds } = this.props;
    const groupsOptions = this.groupsOptions();

    const {
      id: permissionId,
      attributes: { permitted_by: permittedBy, action },
    } = permissionData;
    return (
      <form>
        <StyledFieldset>
          {action === 'taking_survey' && (
            <Radio
              name={`permittedBy-${permissionId}`}
              value="everyone"
              currentValue={permittedBy}
              label={
                <FormattedMessage
                  {...permissionsMessages.permissionsEveryoneLabel}
                />
              }
              onChange={this.handlePermittedByUpdate('everyone')}
              id={`participation-permission-everyone-${permissionId}`}
            />
          )}
          <Radio
            name={`permittedBy-${permissionId}`}
            value="users"
            currentValue={permittedBy}
            label={<FormattedMessage {...messages.permissionsUsersLabel} />}
            onChange={this.handlePermittedByUpdate('users')}
            id={`participation-permission-users-${permissionId}`}
          />
          <Radio
            name={`permittedBy-${permissionId}`}
            value="admins_moderators"
            currentValue={permittedBy}
            label={
              <FormattedMessage
                {...permissionsMessages.permissionsAdministrators}
              />
            }
            onChange={this.handlePermittedByUpdate('admins_moderators')}
            id={`participation-permission-admins-${permissionId}`}
          />
          <Radio
            name={`permittedBy-${permissionId}`}
            value="groups"
            currentValue={permittedBy}
            label={
              <FormattedMessage
                {...permissionsMessages.permissionsSelectionLabel}
              />
            }
            onChange={this.handlePermittedByUpdate('groups')}
            id={`participation-permission-certain-groups-${permissionId}`}
          />
          {permittedBy === 'groups' && (
            <StyledMultipleSelect
              value={groupIds || []}
              options={groupsOptions}
              onChange={this.handleGroupIdsUpdate}
              placeholder={<FormattedMessage {...messages.selectGroups} />}
            />
          )}
        </StyledFieldset>
      </form>
    );
  }
}

const ActionPermissionFormWithHOCs = localize<InputProps & DataProps>(
  ActionForm
);

export default (inputProps: InputProps) => (
  <GetGroups>
    {(groups) => (
      <ActionPermissionFormWithHOCs {...inputProps} groups={groups} />
    )}
  </GetGroups>
);
