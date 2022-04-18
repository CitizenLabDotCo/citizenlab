import React from 'react';

// components
import { Title, Box, Text } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const Header = () => {
  return (
    <Box>
      <Title variant="h1">
        <FormattedMessage {...messages.pageTitle} />
      </Title>
      <Box>
        <Text color="label">
          <FormattedMessage
            {...messages.pageDescription}
            values={{
              representativenessArticleLink: (
                <a
                  href="https://en.wikipedia.org/wiki/Chi-squared_test"
                  target="_blank"
                >
                  <FormattedMessage
                    {...messages.representativenessArticleLink}
                  />
                </a>
              ),
            }}
          />
        </Text>
      </Box>
    </Box>
  );
};

export default Header;
