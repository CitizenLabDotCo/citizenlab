import React from 'react';

// components
import { Box, Title, Text } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

const Header = ({ intl: { formatMessage } }: InjectedIntlProps) => (
  <Box display="flex">
    <Box width="60%">
      <Title variant="h6" as="h4" mt="0px" mb="8px" color="label">
        {formatMessage(messages.options).toUpperCase()}
      </Title>
    </Box>
    <Box width="40%" display="flex">
      <Title width="70%" variant="h6" as="h4" mt="0px" mb="0px" color="label">
        {formatMessage(messages.numberOfTotalResidents).toUpperCase()}
      </Title>
      <Text
        width="30%"
        color="label"
        mt="0px"
        mb="0px"
        variant="bodyS"
        fontWeight="bold"
        pl="20px"
      >
        %
      </Text>
    </Box>
  </Box>
);

export default injectIntl(Header);
