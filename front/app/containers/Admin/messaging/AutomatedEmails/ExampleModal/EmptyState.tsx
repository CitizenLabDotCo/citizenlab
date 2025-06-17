import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../../messages';

const EmptyState = () => {
  const { formatMessage } = useIntl();
  return (
    <Box mb="24px">
      <Text>
        <FormattedMessage {...messages.clickOnButtonForExamples} />
      </Text>
      <Text>
        <FormattedMessage {...messages.seeEmailHereText} />
      </Text>
      <Box display="flex" justifyContent="center" mt="32px">
        <ButtonWithLink
          linkTo={formatMessage(messages.supportButtonLink) as RouteType}
          openLinkInNewTab
        >
          <FormattedMessage {...messages.supportButtonLabel} />
        </ButtonWithLink>
      </Box>
    </Box>
  );
};

export default EmptyState;
