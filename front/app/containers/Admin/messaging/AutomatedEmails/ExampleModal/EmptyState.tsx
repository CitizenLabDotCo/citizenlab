import React from 'react';

// Components
import { Box, Button, Text } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../../messages';

const EmptyState = () => {
  const { formatMessage } = useIntl();
  return (
    <Box mb="24px">
      <Text>
        <FormattedMessage {...messages.noExampleYet} />
      </Text>
      <Box display="flex" justifyContent="center" mt="32px">
        <a
          href={formatMessage(messages.supportButtonLink)}
          target="_blank"
          rel="noreferrer"
        >
          <Button>
            <FormattedMessage {...messages.supportButtonLabel} />
          </Button>
        </a>
      </Box>
    </Box>
  );
};

export default EmptyState;
