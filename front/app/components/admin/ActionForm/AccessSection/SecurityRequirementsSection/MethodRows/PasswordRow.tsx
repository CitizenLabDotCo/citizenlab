import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useIdMethods from 'api/id_methods/useIdMethods';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';

import actionFormMessages from '../../../messages';
import messages from '../messages';

import RequirementToggle from './RequirementToggle';

interface Props {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const getTooltipMessage = (hasSSOAuthMethod: boolean, hasSMSLogin: boolean) => {
  if (!hasSSOAuthMethod) return undefined;

  return hasSMSLogin
    ? messages.passwordOnlyForEmailOrSMSLoginTooltip
    : messages.passwordOnlyForEmailSignupTooltip;
};

const PasswordRow = ({ enabled, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const { data: idMethods } = useIdMethods();

  const hasSSOAuthMethod = !!idMethods?.data.some(
    (method) => method.attributes.authentication_method
  );

  const smsEnabled = useFeatureFlag({ name: 'sms' });
  const smsLoginEnabled = useFeatureFlag({ name: 'sms_login' });
  const hasSMSLogin = smsEnabled && smsLoginEnabled;

  const tooltipMessage = getTooltipMessage(hasSSOAuthMethod, hasSMSLogin);

  return (
    <Box py="12px">
      <RequirementToggle
        icon="lock"
        label={formatMessage(actionFormMessages.requireUserToSetAPassword)}
        description={formatMessage(messages.passwordAvailableDescription)}
        tooltip={tooltipMessage ? formatMessage(tooltipMessage) : undefined}
        enabled={enabled}
        onChange={() => onChange(!enabled)}
      />
    </Box>
  );
};

export default PasswordRow;
