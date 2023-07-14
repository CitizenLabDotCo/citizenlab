import React from 'react';

// components
import { Box, Text, Icon } from '@citizenlab/cl2-component-library';

// styling
import { useTheme } from 'styled-components';
import { stylingConsts } from 'utils/styleUtils';
import { transparentize } from 'polished';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  votes: number;
  votesPercentage: number;
  baskets?: number;
}

const ProgressBar = ({ votes, votesPercentage, baskets }: Props) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();

  return (
    <Box
      w="100%"
      h="28px"
      borderRadius={stylingConsts.borderRadius}
      bgColor={transparentize(0.9, theme.colors.tenantPrimary)}
      position="relative"
    >
      <Box
        w={`${votesPercentage}%`}
        h="100%"
        bgColor={transparentize(0.75, theme.colors.primary)}
        borderRadius={stylingConsts.borderRadius}
      />
      <Box
        position="absolute"
        left="0"
        top="0"
        h="28px"
        display="flex"
        alignItems="center"
      >
        <Text
          m="0"
          color="tenantPrimary"
          ml="12px"
          fontSize="s"
          fontWeight="bold"
        >
          {`${votesPercentage}% (${votes} ${formatMessage(messages.votes)})`}
        </Text>
      </Box>
      {baskets !== undefined && (
        <Box
          position="absolute"
          top="0"
          right="0"
          h="28px"
          display="flex"
          alignItems="center"
        >
          <Text mb="0" mt="1px" mr="4px" color="primary">
            {baskets}
          </Text>
          <Icon
            name="user"
            width="20px"
            height="20px"
            mr="12px"
            fill={theme.colors.primary}
          />
        </Box>
      )}
    </Box>
  );
};

export default ProgressBar;
