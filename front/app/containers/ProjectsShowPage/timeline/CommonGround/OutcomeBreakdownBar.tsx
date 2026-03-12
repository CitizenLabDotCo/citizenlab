import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import Text from 'component-library/components/Text';

interface OutcomeBreakdownBarProps {
  agreedPercent: number;
  unsurePercent: number;
  disagreePercent: number;
  totalCount?: number;
}

const OutcomeBreakdownBar = ({
  agreedPercent,
  unsurePercent,
  disagreePercent,
  totalCount,
}: OutcomeBreakdownBarProps) => {
  const total = agreedPercent + unsurePercent + disagreePercent;
  const emptyPercent = Math.max(0, 100 - total);

  return (
    <Box>
      <Box mb="4px" display="flex" alignItems="center">
        <Text
          as="span"
          fontWeight="bold"
          fontSize="s"
          color="green500"
          mr="8px"
          my="0px"
        >
          {agreedPercent}%
        </Text>
        <Text
          as="span"
          fontWeight="bold"
          fontSize="s"
          color="coolGrey500"
          mr="8px"
          my="0px"
        >
          {unsurePercent}%
        </Text>
        <Text
          as="span"
          fontWeight="bold"
          fontSize="s"
          color="red500"
          mr="8px"
          my="0px"
        >
          {disagreePercent}%
        </Text>
        {typeof totalCount === 'number' && (
          <Text as="span" color="grey800" my="0px">
            ({totalCount})
          </Text>
        )}
      </Box>
      <Box
        height="16px"
        borderRadius="3px"
        display="flex"
        overflow="hidden"
        border={`1px solid ${colors.coolGrey300}`}
        width="100%"
        bg={colors.background}
      >
        <Box width={`${agreedPercent}%`} bg={colors.green500} />
        <Box width={`${unsurePercent}%`} bg={colors.coolGrey500} />
        <Box width={`${disagreePercent}%`} bg={colors.red500} />
        {emptyPercent > 0 && (
          <Box width={`${emptyPercent}%`} bg={colors.white} />
        )}
      </Box>
    </Box>
  );
};

export default OutcomeBreakdownBar;
