import React, { useState, useEffect } from 'react';

import { Box, Icon, Success, colors } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

interface Props {
  email?: string;
}

const CodeSentMessage = ({ email }: Props) => {
  const [storedEmail, setStoredEmail] = useState<string | undefined>();

  const { data: authUser } = useAuthUser();
  const userEmail =
    email ??
    (isNilOrError(authUser) ? undefined : authUser.data.attributes.email);

  useEffect(() => {
    if (userEmail) {
      setStoredEmail(userEmail);
    }
  }, [userEmail]);

  return (
    <Box display="flex" alignItems="center" mb="20px">
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
              userEmail: <strong>{storedEmail ?? userEmail}</strong>,
            }}
          />
        }
      />
    </Box>
  );
};

export default CodeSentMessage;
