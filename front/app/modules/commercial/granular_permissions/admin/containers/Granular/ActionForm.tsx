import React from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';

import localize, { InjectedLocalized } from 'utils/localize';
import GetGroups, { GetGroupsChildProps } from 'resources/GetGroups';

import MultipleSelect from 'components/UI/MultipleSelect';
import { Radio } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import permissionsMessages from 'containers/Admin/projects/project/permissions/messages';
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
  projectType?: 'defaultInput' | 'initiative' | 'nativeSurvey';
  onChange: (
    permittedBy: IPermissionData['attributes']['permitted_by'],
    groupIds: Props['groupIds']
  ) => void;
}

interface DataProps {
  groups: GetGroupsChildProps;
}

export interface Props extends InputProps, DataProps, InjectedLocalized {}

const ActionForm = ({
  groups: { groupsList },
  permissionData,
  groupIds,
  projectType,
  onChange,
  localize,
}: Props) => {
  const groupsOptions = () => {
    if (isNilOrError(groupsList)) {
      return [];
    } else {
      return groupsList.map((group) => ({
        label: localize(group.attributes.title_multiloc),
        value: group.id,
      }));
    }
  };

  const handlePermittedByUpdate =
    (value: IPermissionData['attributes']['permitted_by']) => () => {
      onChange(value, groupIds);
    };

  const handleGroupIdsUpdate = (options: { value: string }[]) => {
    onChange(
      permissionData.attributes.permitted_by,
      options.map((o) => o.value)
    );
  };

  const {
    id: permissionId,
    attributes: { permitted_by: permittedBy, action },
  } = permissionData;
  return (
    <form>
      <StyledFieldset>
        {/* TODO: Take a decision on which action we should use for native surveys versus ideation. One or separate? 
        If separate, we will need to update code where we check for attributes.posting_idea */}
        {(action === 'taking_survey' || projectType === 'nativeSurvey') && (
          <Radio
            name={`permittedBy-${permissionId}`}
            value="everyone"
            currentValue={permittedBy}
            label={
              <FormattedMessage
                {...permissionsMessages.permissionsAnyoneLabel}
              />
            }
            onChange={handlePermittedByUpdate('everyone')}
            id={`participation-permission-everyone-${permissionId}`}
          />
        )}
        <Radio
          name={`permittedBy-${permissionId}`}
          value="users"
          currentValue={permittedBy}
          label={<FormattedMessage {...messages.permissionsUsersLabel} />}
          onChange={handlePermittedByUpdate('users')}
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
          onChange={handlePermittedByUpdate('admins_moderators')}
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
          onChange={handlePermittedByUpdate('groups')}
          id={`participation-permission-certain-groups-${permissionId}`}
        />
        {permittedBy === 'groups' && (
          <StyledMultipleSelect
            value={groupIds || []}
            options={groupsOptions()}
            onChange={handleGroupIdsUpdate}
            placeholder={<FormattedMessage {...messages.selectGroups} />}
          />
        )}
      </StyledFieldset>
    </form>
  );
};

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
