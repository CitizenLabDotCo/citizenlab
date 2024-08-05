import React from 'react';

import {
  CardButton,
  Box,
  Icon,
  colors,
} from '@citizenlab/cl2-component-library';

import { PermittedBy } from 'api/phase_permissions/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  isSurveyAction: boolean;
  permittedBy: PermittedBy;
  onUpdate: (permittedBy: PermittedBy) => void;
}

const CardButtons = ({ isSurveyAction, permittedBy, onUpdate }: Props) => {
  const { formatMessage } = useIntl();
  const userConfirmationEnabled = useFeatureFlag({ name: 'user_confirmation' });

  const handleUpdate = (permittedBy: PermittedBy) => (e) => {
    e.preventDefault();
    onUpdate(permittedBy);
  };

  return (
    <>
      {isSurveyAction && (
        <Box>
          <CardButton
            id="e2e-permission-anyone"
            icon={
              <Icon
                name="user-circle"
                fill={colors.teal200}
                width="32px"
                height="32px"
              />
            }
            title={formatMessage(messages.none)}
            subtitle={formatMessage(messages.noneSubtitle)}
            onClick={handleUpdate('everyone')}
            selected={permittedBy === 'everyone'}
            height="100%"
          />
        </Box>
      )}
      <Box>
        <CardButton
          id="e2e-permission-email-confirmed-users"
          icon={
            <Box display="flex" flexDirection="row">
              <Icon
                name="user-circle"
                fill={colors.teal200}
                width="32px"
                height="32px"
              />
              <Icon name="email" fill={colors.teal300} width="16px" />
            </Box>
          }
          title={formatMessage(messages.emailConfirmation)}
          subtitle={formatMessage(messages.emailConfirmationSubtitle)}
          onClick={handleUpdate('everyone_confirmed_email')}
          selected={permittedBy === 'everyone_confirmed_email'}
          disabled={!userConfirmationEnabled}
          height="100%"
        />
      </Box>
      <Box>
        <CardButton
          id="e2e-permission-registered-users"
          icon={
            <Box display="flex" flexDirection="row">
              <Icon
                name="user-circle"
                fill={colors.teal200}
                width="32px"
                height="32px"
              />
              <Icon name="email" fill={colors.teal300} width="16px" />
              <Icon name="list" fill={colors.teal300} width="16px" />
            </Box>
          }
          title={formatMessage(messages.accountCreation)}
          subtitle={formatMessage(messages.accountCreationSubtitle)}
          onClick={handleUpdate('users')}
          selected={permittedBy === 'users'}
          height="100%"
        />
      </Box>
      <Box>
        <CardButton
          id="e2e-permission-custom"
          icon={
            <Box display="flex" flexDirection="row">
              <Icon
                name="user-circle"
                fill={colors.teal200}
                width="32px"
                height="32px"
              />
              <Icon name="shield-check" fill={colors.teal300} width="16px" />
            </Box>
          }
          title={formatMessage(messages.ssoVerification)}
          subtitle={formatMessage(messages.ssoVerificationSubtitle)}
          onClick={handleUpdate('verified')}
          selected={permittedBy === 'verified'}
          height="100%"
        />
      </Box>
    </>
  );
};

export default CardButtons;
