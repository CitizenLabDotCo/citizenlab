import React from 'react';

import { Title, Box, Text } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

const Header = () => (
  <Box mb="36px">
    <Title color="primary" variant="h1">
      <FormattedMessage {...messages.pageTitle} />
    </Title>
    <Box>
      <Text color="textSecondary">
        {/* <FormattedMessage
          {...messages.pageDescription}
          values={{
            representativenessArticleLink: <RepresentativenessArticleLink />,
          }}
        /> */}
        <FormattedMessage {...messages.pageDescriptionTemporary} />
      </Text>
    </Box>
  </Box>
);

export default Header;
