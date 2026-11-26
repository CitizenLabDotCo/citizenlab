import React from 'react';

import { Box, colors, Text } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

type Props = {
  number: number;
  isFilled: boolean;
};

const PinNumberBadge = ({ number, isFilled }: Props) => {
  const theme = useTheme();

  return (
    <Box
      width="24px"
      height="24px"
      flexShrink={0}
      borderRadius="50%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      // A filled badge carries the colour of the pin it names on the map.
      background={isFilled ? theme.colors.tenantPrimary : colors.grey200}
    >
      <Text
        m="0"
        as="span"
        fontWeight="bold"
        fontSize="xs"
        color={isFilled ? 'white' : 'coolGrey600'}
      >
        {number}
      </Text>
    </Box>
  );
};

export default PinNumberBadge;
