import React from 'react';

import { IconTooltip } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  className?: string;
};

const PasswordInputIconTooltip = ({ className }: Props) => {
  const { formatMessage } = useIntl();
  return (
    <IconTooltip
      placement="top-start"
      className={className}
      iconAriaTitle={formatMessage(messages.passwordStrengthTooltip1)}
      content={
        <>
          <p>{formatMessage(messages.passwordStrengthTooltip1)}</p>
          <ul>
            <li>{formatMessage(messages.passwordStrengthTooltip2)}</li>
            <li>{formatMessage(messages.passwordStrengthTooltip3)}</li>
            <li>{formatMessage(messages.passwordStrengthTooltip4)}</li>
          </ul>
        </>
      }
    />
  );
};

export default PasswordInputIconTooltip;
