import React from 'react';

// Components
import { Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

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
        <Button
          linkTo={formatMessage(messages.supportButtonLink)}
          openLinkInNewTab
        >
          <FormattedMessage {...messages.supportButtonLabel} />
        </Button>
      </Box>
    </Box>
  );
};

export default EmptyState;
