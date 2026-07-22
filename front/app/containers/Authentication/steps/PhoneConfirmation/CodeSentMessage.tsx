import React, { useEffect, useState } from 'react';

import { Box, Icon, Success, colors } from '@citizenlab/cl2-component-library';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  phoneNumber: string;
  codeResent: boolean;
}

const CodeSentMessage = ({ phoneNumber, codeResent }: Props) => {
  const [screenReaderMessage, setScreenReaderMessage] = useState<string>('');
  const { formatMessage } = useIntl();

  useEffect(() => {
    if (codeResent) {
      setScreenReaderMessage(formatMessage(messages.confirmationCodeSent));
    }
  }, [codeResent, formatMessage]);

  return (
    <Box display="flex" alignItems="center" mb="20px">
      <ScreenReaderOnly aria-live="polite">
        {screenReaderMessage}
      </ScreenReaderOnly>
      <Icon
        width="30px"
        height="30px"
        name="check-circle"
        fill={colors.success}
      />
      <Success
        text={
          <FormattedMessage
            {...messages.anSMSCodeHasBeenSent}
            values={{ phoneNumber: <strong>{phoneNumber}</strong> }}
          />
        }
      />
    </Box>
  );
};

export default CodeSentMessage;
