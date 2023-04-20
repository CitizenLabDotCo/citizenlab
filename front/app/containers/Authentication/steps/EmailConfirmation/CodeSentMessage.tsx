import React, { useState, useEffect } from 'react';

// hooks
import useAuthUser from 'hooks/useAuthUser';

// components
import { Box, Icon, Success } from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  email?: string;
}

const CodeSentMessage = ({ email }: Props) => {
  const [storedEmail, setStoredEmail] = useState<string | undefined>();

  const authUser = useAuthUser();
  const userEmail =
    email ?? (isNilOrError(authUser) ? undefined : authUser.attributes.email);

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
