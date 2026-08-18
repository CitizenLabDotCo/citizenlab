import React from 'react';

import useIdMethods from 'api/id_methods/useIdMethods';

import { useIntl } from 'utils/cl-intl';

import actionFormMessages from '../../../messages';
import messages from '../messages';

import RequirementToggle from './RequirementToggle';

interface Props {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const PasswordRow = ({ enabled, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const { data: idMethods } = useIdMethods();
  const hasSSOAuthMethod = idMethods?.data.some(
    (method) => method.attributes.authentication_method
  );

  return (
    <RequirementToggle
      icon="lock"
      label={formatMessage(actionFormMessages.password)}
      description={formatMessage(messages.passwordAvailableDescription)}
      tooltip={
        hasSSOAuthMethod
          ? formatMessage(messages.passwordOnlyForEmailSignupTooltip)
          : undefined
      }
      enabled={enabled}
      onChange={() => onChange(!enabled)}
    />
  );
};

export default PasswordRow;
