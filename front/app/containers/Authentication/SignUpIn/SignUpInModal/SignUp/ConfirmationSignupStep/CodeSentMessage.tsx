import React from 'react';

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

// utils

const CodeSentMessage = () => {
  const user = useAuthUser();
  if (isNilOrError(user)) return null;

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
              userEmail: <strong>{user.attributes.email}</strong>,
            }}
          />
        }
      />
    </Box>
  );
};

export default CodeSentMessage;
