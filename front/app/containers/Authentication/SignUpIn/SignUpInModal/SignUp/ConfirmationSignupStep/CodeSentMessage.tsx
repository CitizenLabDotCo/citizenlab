import React from 'react';

// components
import { Box, Icon, Success } from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

interface Props {
  email?: string;
}

const CodeSentMessage = ({ email }: Props) => (
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
            userEmail: <strong>{email}</strong>,
          }}
        />
      }
    />
  </Box>
);

export default CodeSentMessage;
