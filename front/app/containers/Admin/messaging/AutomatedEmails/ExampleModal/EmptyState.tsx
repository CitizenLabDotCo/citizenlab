import React from 'react';

// Components
import { Box, Button, Text } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

const EmptyState = () => {
  return (
    <Box mb="24px">
      <Text>
        <FormattedMessage {...messages.noExampleYet} />
      </Text>
      <Box display="flex" justifyContent="center" mt="32px">
        <Button>
          <FormattedMessage {...messages.supportButtonLabel} />
        </Button>
      </Box>
    </Box>
  );
};

export default EmptyState;
