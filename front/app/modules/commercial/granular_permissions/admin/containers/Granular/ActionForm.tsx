import React from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';

import localize, { InjectedLocalized } from 'utils/localize';
import GetGroups, { GetGroupsChildProps } from 'resources/GetGroups';

import MultipleSelect from 'components/UI/MultipleSelect';
import {
  Box,
  IconTooltip,
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
    permittedBy:
      | IPermissionData['attributes']['permitted_by']
      | IPermissionData['attributes']['global_custom_fields'],
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
      <Box mb="10px">
        <Toggle
          checked={permittedBy === 'admins_moderators'}
          label={
            <Box display="flex">
              <span style={{ color: colors.primary }}>
                <FormattedMessage
                  {...permissionsMessages.permissionsAdminsAndCollaborators}
                />
              </span>

              <IconTooltip
                ml="4px"
                icon="info-solid"
                content={formatMessage(
                  permissionsMessages.permissionsAdminsAndCollaboratorsTooltip
                )}
              />
            </Box>
          }
          onChange={handlePermittedByUpdate(
            permittedBy === 'admins_moderators' ? 'users' : 'admins_moderators'
          )}
          id={`participation-permission-admins-${permissionId}`}
        />
      </Box>
      {permittedBy !== 'admins_moderators' && (
        <Box mt="20px">
          <Box display="flex" gap="16px" mb="20px">
            {/* TODO: Take a decision on which action we should use for native surveys versus ideation. One or separate?
            If separate, we will need to update code where we check for attributes.posting_idea */}
            {(action === 'taking_survey' || projectType === 'nativeSurvey') && (
              <PermissionCardButton
                title={permissionsMessages.permissionsAnyoneLabel}
                subtitle={permissionsMessages.permissionsAnyoneLabelDescription}
                onClick={handlePermittedByUpdate('everyone')}
                selected={permittedBy === 'everyone'}
              />
            )}
            {emailConfirmPermissionEnabled && (
              <PermissionCardButton
                id="e2e-permission-email-confirmed-users"
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
              id="e2e-permission-registered-users"
              iconName="user-circle"
              title={messages.permissionsUsersLabel}
              subtitle={messages.permissionsUsersLabelDescription}
              onClick={handlePermittedByUpdate('users')}
              selected={permittedBy === 'users'}
            />
            <PermissionCardButton
              iconName="group"
              title={permissionsMessages.permissionsSelectionLabel}
              subtitle={
                permissionsMessages.permissionsSelectionLabelDescription
              }
              onClick={handlePermittedByUpdate('groups')}
              selected={permittedBy === 'groups'}
            />
          </Box>
          {permittedBy === 'groups' && (
            <Box
              mt="10px"
              borderLeft={`solid 1px ${colors.grey300}`}
              px="20px"
              pt="10px"
              pb="20px"
            >
              <Title
                variant="h4"
                color="primary"
                style={{ fontWeight: 600 }}
                mt="5px"
              >
                <FormattedMessage {...messages.selectUserGroups} />
              </Title>
              <StyledMultipleSelect
                value={groupIds || []}
                options={groupsOptions()}
                onChange={handleGroupIdsUpdate}
                placeholder={<FormattedMessage {...messages.selectGroups} />}
              />
            </Box>
          )}
          {permittedBy === 'everyone_confirmed_email' && (
            <Box mt="16px" maxWidth="740px" mb="20px">
              <Warning>
                {formatMessage(messages.permissionEveryoneEmailWarning)}
              </Warning>
            </Box>
          )}
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
