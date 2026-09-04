import React, { useState, useEffect } from 'react';

import { Box, Icon, Success, colors } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

interface Props {
  email?: string;
  codeResent: boolean;
  // The merge-account step names the address in its own warning, so the banner
  // there would only repeat it. Only the banner is dropped: the live region is
  // the sole announcement a screen reader gets when a new code is sent.
  showBanner?: boolean;
}

const CodeSentMessage = ({ email, codeResent, showBanner = true }: Props) => {
  const [storedEmail, setStoredEmail] = useState<string | undefined>();
  const [screenReaderMessage, setScreenReaderMessage] = useState<string>('');
  const { formatMessage } = useIntl();

  const { data: authUser } = useAuthUser();
  const userEmail =
    email ??
    (isNilOrError(authUser) ? undefined : authUser.data.attributes.email);

  useEffect(() => {
    if (userEmail) {
      setStoredEmail(userEmail);
    }
  }, [userEmail]);

  useEffect(() => {
    if (codeResent) {
      setScreenReaderMessage(formatMessage(messages.confirmationCodeSent));
    }
  }, [codeResent, formatMessage]);

  const liveRegion = (
    <ScreenReaderOnly aria-live="polite">
      {screenReaderMessage}
    </ScreenReaderOnly>
  );

  if (!showBanner) return liveRegion;

  return (
    <Box display="flex" alignItems="center" mb="20px">
      {liveRegion}
      <Icon
        width="30px"
        height="30px"
        name="check-circle"
        fill={colors.success}
      />
      <Success
        text={
          <FormattedMessage
            {...messages.anExampleCodeHasBeenSent}
            values={{
              userEmail: (
                <strong data-cy="confirmation-email">
                  {storedEmail ?? userEmail}
                </strong>
              ),
            }}
          />
        }
      />
    </Box>
  );
};

export default CodeSentMessage;
