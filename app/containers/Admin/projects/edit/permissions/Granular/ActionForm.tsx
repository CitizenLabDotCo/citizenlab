import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';

import localize, { InjectedLocalized } from 'utils/localize';
import GetGroups, { GetGroupsChildProps } from 'resources/GetGroups';

import MultipleSelect from 'components/UI/MultipleSelect';
import Radio from 'components/UI/Radio';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const StyledFieldset = styled.fieldset`
  border: none;
  padding: 0;
`;

const StyledMultipleSelect = styled(MultipleSelect)`
  width: 300px;
`;

interface InputProps {
  permissionId: string;
  permittedBy: 'everyone' | 'groups' | 'admins_moderators';
  groupIds?: string[];
  onChange: (
    permittedBy: Props['permittedBy'],
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

  handlePermittedByUpdate = (value: InputProps['permittedBy']) => () => {
    const { groupIds, onChange } = this.props;
    onChange(value, groupIds);
  };

  handleGroupIdsUpdate = (options: { value: string }[]) => {
    const { permittedBy, onChange } = this.props;
    onChange(
      permittedBy,
      options.map((o) => o.value)
    );
  };

  render() {
    const { permissionId, permittedBy, groupIds } = this.props;
    const groupsOptions = this.groupsOptions();
    return (
      <form>
        <StyledFieldset>
          <Radio
            name={`permittedBy-${permissionId}`}
            value="everyone"
            currentValue={permittedBy}
            label={<FormattedMessage {...messages.permissionsEveryoneLabel} />}
            onChange={this.handlePermittedByUpdate('everyone')}
            id={`participation-permission-everyone-${permissionId}`}
          />
          <Radio
            name={`permittedBy-${permissionId}`}
            value="admins_moderators"
            currentValue={permittedBy}
            label={<FormattedMessage {...messages.permissionsAdministrators} />}
            onChange={this.handlePermittedByUpdate('admins_moderators')}
            id={`participation-permission-admins-${permissionId}`}
          />
          <Radio
            name={`permittedBy-${permissionId}`}
            value="groups"
            currentValue={permittedBy}
            label={<FormattedMessage {...messages.permissionsSelectionLabel} />}
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
