import React from 'react';

import {
  Box,
  IconTooltip,
  Toggle,
  colors,
  Title,
  CardButton,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useGroups from 'api/groups/useGroups';
import { IPermissionData } from 'api/permissions/types';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import permissionsMessages from 'containers/Admin/projects/project/permissions/messages';

import MultipleSelect from 'components/UI/MultipleSelect';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

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
  const userConfirmationEnabled = useFeatureFlag({ name: 'user_confirmation' });
  const isGranularPermissionsEnabled = useFeatureFlag({
    name: 'granular_permissions',
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
      if (isGranularPermissionsEnabled) {
        onChange(value, groupIds);
      }
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
        <Tooltip
          placement="bottom-start"
          disabled={
            permittedBy === 'everyone' ? true : isGranularPermissionsEnabled
          }
          content={
            <FormattedMessage {...messages.granularPermissionsOffMessage} />
          }
        >
          <Box w="fit-content">
            <Toggle
              checked={permittedBy === 'admins_moderators'}
              disabled={!isGranularPermissionsEnabled}
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
                permittedBy === 'admins_moderators'
                  ? 'users'
                  : 'admins_moderators'
              )}
              id={`participation-permission-admins-${permissionId}`}
            />
          </Box>
        </Tooltip>
      </Box>
      {permittedBy !== 'admins_moderators' && (
        <Box mt="20px">
          <Box display="flex" gap="16px" mb="20px">
            {(action === 'taking_survey' ||
              (projectType === 'nativeSurvey' &&
                action === 'posting_idea')) && (
              <Tooltip
                disabled={
                  permittedBy === 'everyone'
                    ? true
                    : isGranularPermissionsEnabled
                }
                content={
                  <FormattedMessage
                    {...messages.granularPermissionsOffMessage}
                  />
                }
              >
                <CardButton
                  height="100%"
                  title={formatMessage(
                    permissionsMessages.permissionsAnyoneLabel
                  )}
                  subtitle={formatMessage(
                    permissionsMessages.permissionsAnyoneLabelDescription
                  )}
                  onClick={handlePermittedByUpdate('everyone')}
                  selected={permittedBy === 'everyone'}
                  disabled={!isGranularPermissionsEnabled}
                />
              </Tooltip>
            )}
            <Tooltip
              // user_confirmation needs to be enabled for this option to work and granular permissions should be turned on to give users this feature
              disabled={
                isGranularPermissionsEnabled
                  ? userConfirmationEnabled
                  : permittedBy === 'everyone_confirmed_email'
                  ? true
                  : isGranularPermissionsEnabled
              }
              content={
                <FormattedMessage
                  {...(isGranularPermissionsEnabled
                    ? messages.userConfirmationRequiredTooltip
                    : messages.granularPermissionsOffMessage)}
                />
              }
            >
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
                disabled={
                  isGranularPermissionsEnabled ? !userConfirmationEnabled : true
                }
                height="100%"
              />
            </Tooltip>
            <Tooltip
              disabled={
                permittedBy === 'users' ? true : isGranularPermissionsEnabled
              }
              content={
                <FormattedMessage {...messages.granularPermissionsOffMessage} />
              }
            >
              <CardButton
                id="e2e-permission-registered-users"
                iconName="user-circle"
                title={formatMessage(messages.permissionsUsersLabel)}
                subtitle={formatMessage(
                  messages.permissionsUsersLabelDescription
                )}
                onClick={handlePermittedByUpdate('users')}
                selected={permittedBy === 'users'}
                disabled={!isGranularPermissionsEnabled}
                height="100%"
              />
            </Tooltip>
            <Tooltip
              disabled={
                permittedBy === 'groups' ? true : isGranularPermissionsEnabled
              }
              content={
                <FormattedMessage {...messages.granularPermissionsOffMessage} />
              }
            >
              <CardButton
                id="e2e-permission-user-groups"
                iconName="group"
                title={formatMessage(
                  permissionsMessages.permissionsSelectionLabel
                )}
                subtitle={formatMessage(
                  permissionsMessages.permissionsSelectionLabelDescription
                )}
                onClick={handlePermittedByUpdate('groups')}
                selected={permittedBy === 'groups'}
                disabled={!isGranularPermissionsEnabled}
              />
            </Tooltip>
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
                id="e2e-select-user-group"
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
