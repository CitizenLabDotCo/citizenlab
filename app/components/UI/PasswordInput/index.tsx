import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// hooks
import useTenant from 'hooks/useTenant';

// components
import PasswordInput, { Props } from './PasswordInput';

const Component = ({
  intl: { formatMessage },
  ...props
}: Props & InjectedIntlProps) => {
  const tenant = useTenant();

  if (!isNilOrError(tenant)) {
    const minimumPasswordLength =
      tenant.data.attributes.settings.password_login?.minimum_length;
    const minimumPasswordLengthError = minimumPasswordLength
      ? formatMessage(messages.minimumPasswordLengthErrorMessage, {
          minimumPasswordLength,
        })
      : null;

    return <PasswordInput error={minimumPasswordLengthError} {...props} />;
  }

  return null;
};

export default injectIntl(Component);
