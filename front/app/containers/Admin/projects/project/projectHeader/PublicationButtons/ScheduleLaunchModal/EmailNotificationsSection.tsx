import React from 'react';

import {
  Box,
  Text,
  Toggle,
  IconTooltip,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const EmailNotificationsSection = ({ checked, onChange, disabled }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box mb="24px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap="4px">
          <Text fontWeight="bold" mb="0px">
            {formatMessage(messages.sendEmailNotifications)}
          </Text>
          {disabled && (
            <IconTooltip
              content={formatMessage(
                messages.emailNotificationsDisabledGlobally
              )}
            />
          )}
        </Box>
        <Toggle
          checked={checked && !disabled}
          onChange={() => onChange(!checked)}
          disabled={disabled}
        />
      </Box>
    </Box>
  );
};

export default EmailNotificationsSection;
