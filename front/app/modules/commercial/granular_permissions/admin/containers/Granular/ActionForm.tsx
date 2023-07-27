import React from 'react';
import styled from 'styled-components';

import MultipleSelect from 'components/UI/MultipleSelect';
import {
  Box,
  IconTooltip,
  Toggle,
  colors,
  Title,
  CardButton,
} from '@citizenlab/cl2-component-library';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';
import permissionsMessages from 'containers/Admin/projects/project/permissions/messages';
import { IPermissionData } from 'services/actionPermissions';
import Warning from 'components/UI/Warning';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useGroups from 'api/groups/useGroups';
import useLocalize from 'hooks/useLocalize';

const StyledMultipleSelect = styled(MultipleSelect)`
  width: 300px;
`;

interface Props {
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

const ActionForm = ({
  permissionData,
  groupIds,
  projectType,
  onChange,
}: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { data: groups } = useGroups({});
  const emailConfirmPermissionEnabled = useFeatureFlag({
    name: 'permission_option_email_confirmation',
  });

  const groupsOptions = () => {
    if (!groups) {
      return [];
    } else {
      return groups.data.map((group) => ({
        label: localize(group.attributes.title_multiloc),
        value: group.id,
      }));
    }
  };

  const handlePermittedByUpdate =
    (value: IPermissionData['attributes']['permitted_by']) => (e) => {
      e.preventDefault();
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
              <CardButton
                title={formatMessage(
                  permissionsMessages.permissionsAnyoneLabel
                )}
                subtitle={formatMessage(
                  permissionsMessages.permissionsAnyoneLabelDescription
                )}
                onClick={handlePermittedByUpdate('everyone')}
                selected={permittedBy === 'everyone'}
              />
            )}
            {emailConfirmPermissionEnabled && (
              <CardButton
                id="e2e-permission-email-confirmed-users"
                iconName="email"
                title={formatMessage(
                  permissionsMessages.permissionsEmailConfirmLabel
                )}
                subtitle={formatMessage(
                  permissionsMessages.permissionsEmailConfirmLabelDescription
                )}
                onClick={handlePermittedByUpdate('everyone_confirmed_email')}
                selected={permittedBy === 'everyone_confirmed_email'}
              />
            )}
            <CardButton
              id="e2e-permission-registered-users"
              iconName="user-circle"
              title={formatMessage(messages.permissionsUsersLabel)}
              subtitle={formatMessage(
                messages.permissionsUsersLabelDescription
              )}
              onClick={handlePermittedByUpdate('users')}
              selected={permittedBy === 'users'}
            />
            <CardButton
              iconName="group"
              title={formatMessage(
                permissionsMessages.permissionsSelectionLabel
              )}
              subtitle={formatMessage(
                permissionsMessages.permissionsSelectionLabelDescription
              )}
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

export default ActionForm;
