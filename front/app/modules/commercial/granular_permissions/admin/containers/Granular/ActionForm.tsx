import React from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';

import localize, { InjectedLocalized } from 'utils/localize';
import GetGroups, { GetGroupsChildProps } from 'resources/GetGroups';

import MultipleSelect from 'components/UI/MultipleSelect';
import {
  Box,
  IconTooltip,
  Radio,
  Toggle,
  colors,
  Title,
} from '@citizenlab/cl2-component-library';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';
import permissionsMessages from 'containers/Admin/projects/project/permissions/messages';
import { IPermissionData } from 'services/actionPermissions';
import Warning from 'components/UI/Warning';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { PermissionCardButton } from 'components/admin/GranularPermissions/PermissionCardButton';

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
  const { formatMessage } = useIntl();
  const emailConfirmPermissionEnabled = useFeatureFlag({
    name: 'permission_option_email_confirmation',
  });

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
      <Box mb="32px">
        <Toggle
          checked={permittedBy === 'admins_moderators'}
          label={
            <Box display="flex">
              <span style={{ color: colors.primary }}>
                <FormattedMessage
                  {...permissionsMessages.permissionsAdminsAndCollaborators}
                />
              </span>

              <IconTooltip ml="4px" icon="info-solid" content="" />
            </Box>
          }
          onChange={handlePermittedByUpdate('admins_moderators')}
          id={`participation-permission-admins-${permissionId}`}
        />
      </Box>
      <Box display="flex" gap="16px">
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
        {emailConfirmPermissionEnabled && (
          <PermissionCardButton
            iconName="email"
            title={permissionsMessages.permissionsEmailConfirmLabel}
            subtitle={
              permissionsMessages.permissionsEmailConfirmLabelDescription
            }
            onClick={handlePermittedByUpdate('everyone_confirmed_email')}
            selected={permittedBy === 'everyone_confirmed_email'}
          />
        )}
        <PermissionCardButton
          iconName="user-circle"
          title={messages.permissionsUsersLabel}
          subtitle={messages.permissionsUsersLabelDescription}
          onClick={handlePermittedByUpdate('users')}
          selected={permittedBy === 'users'}
        />
        <PermissionCardButton
          iconName="sidebar-users"
          title={permissionsMessages.permissionsSelectionLabel}
          subtitle={permissionsMessages.permissionsSelectionLabelDescription}
          onClick={handlePermittedByUpdate('groups')}
          selected={permittedBy === 'groups'}
        />
      </Box>
      {permittedBy === 'groups' && (
        <Box mt="24px">
          <Title variant="h5" fontWeight={'normal'} color={'coolGrey600'}>
            Select user groups
          </Title>
          <StyledMultipleSelect
            value={groupIds || []}
            options={groupsOptions()}
            onChange={handleGroupIdsUpdate}
            placeholder={<FormattedMessage {...messages.selectGroups} />}
          />
        </Box>
      )}
      {permittedBy === 'everyone' && (
        <Box mt="16px" maxWidth="620px">
          <Warning>
            {formatMessage(messages.permissionEveryoneEmailWarning)}
          </Warning>
        </Box>
      )}
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
