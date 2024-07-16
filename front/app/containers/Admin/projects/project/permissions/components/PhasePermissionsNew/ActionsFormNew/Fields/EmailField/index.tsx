import React, { useState } from 'react';

import {
  Box,
  Button,
  stylingConsts,
  Text,
  Toggle,
} from '@citizenlab/cl2-component-library';

import { IPhasePermissionAction } from 'api/permissions/types';
import {
  IPermissionsFieldData,
  EmailConfig,
} from 'api/permissions_fields/types';
import useUpdatePermissionsField from 'api/permissions_fields/useUpdatePermissionsField';

import { useIntl } from 'utils/cl-intl';

import Tooltip from '../../Tooltip';
import { DISABLED_COLOR } from '../constants';
import messages from '../messages';

import EmailModal from './EmailModal';
import emailMessages from './messages';

const isEmailConfig = (
  config: IPermissionsFieldData['attributes']['config']
): config is EmailConfig => {
  return 'password' in config && 'confirmed' in config;
};

const getEmailMessage = (
  enabled: boolean,
  { confirmed, password }: EmailConfig
) => {
  if (!enabled) return messages.notAsked;

  if (confirmed && password) return emailMessages.emailConfirmationAndPassword;
  if (confirmed && !password) return emailMessages.emailConfirmation;
  if (!confirmed && password) return emailMessages.password;
  return emailMessages.emailOnly;
};

interface Props {
  field: IPermissionsFieldData;
  phaseId: string;
  disableEditing: boolean;
  action: IPhasePermissionAction;
}

const EmailField = ({ field, phaseId, disableEditing, action }: Props) => {
  const { config, enabled } = field.attributes;

  const { formatMessage } = useIntl();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutate: updatePermissionsField } = useUpdatePermissionsField({
    phaseId,
    action,
  });

  const customTooltipMessage = disableEditing
    ? undefined
    : emailMessages.emailCannotBeControlledYet;

  // Type guard, should always be true
  if (!isEmailConfig(config)) return null;

  return (
    <>
      <Box
        pt="14px"
        pb="13px"
        borderTop={stylingConsts.border}
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        bgColor={disableEditing ? DISABLED_COLOR : undefined}
      >
        <Box>
          <Text
            m="0"
            fontSize="m"
            color={disableEditing ? 'grey800' : 'primary'}
          >
            {formatMessage(emailMessages.email)}
          </Text>
          <Text
            m="0"
            fontSize="s"
            color={disableEditing ? 'grey700' : 'grey800'}
          >
            {formatMessage(getEmailMessage(enabled, config))}
          </Text>
        </Box>
        <Box display="flex" flexDirection="row">
          {enabled && (
            <Button
              icon="edit"
              buttonStyle="text"
              p="0"
              m="0"
              mr="22px"
              onClick={() => setIsModalOpen(true)}
            >
              {formatMessage(messages.edit)}
            </Button>
          )}
          <Tooltip
            disabled={false}
            placement="left"
            message={customTooltipMessage}
          >
            <Box
              mb="-4px" // cancel out te bottom margin of the Toggle
            >
              <Toggle
                checked={enabled}
                disabled={true}
                onChange={() => {
                  updatePermissionsField({
                    id: field.id,
                    enabled: !enabled,
                  });
                }}
              />
            </Box>
          </Tooltip>
        </Box>
      </Box>
      <EmailModal
        opened={isModalOpen}
        config={config}
        disableEditing={disableEditing}
        onClose={() => setIsModalOpen(false)}
        onUpdateConfig={(config) =>
          updatePermissionsField({
            id: field.id,
            config,
          })
        }
      />
    </>
  );
};

export default EmailField;
