import React from 'react';

// components
import { Box, Title, Text } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

const Header = ({ intl: { formatMessage } }: InjectedIntlProps) => (
  <Box display="flex">
    <Box width="50%">
      <Title variant="h6" as="h4" mt="0px" mb="8px" color="label">
        {formatMessage(messages.options).toUpperCase()}
      </Title>
    </Box>
    <Box width="50%" display="flex" justifyContent="space-between">
      <Title variant="h6" as="h4" mt="0px" mb="8px" color="label">
        {formatMessage(messages.numberOfTotalResidents).toUpperCase()}
      </Title>
      <Text
        mr="44px"
        color="label"
        mt="0px"
        mb="0px"
        variant="bodyS"
        fontWeight="bold"
      >
        %
      </Text>
    </Box>
  </Box>
);

export default injectIntl(Header);
