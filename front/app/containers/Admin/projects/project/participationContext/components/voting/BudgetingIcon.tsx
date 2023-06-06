import React from 'react';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';

const MoneyIcon = ({ mr }: { mr?: string }) => (
  <Box bgColor={colors.teal200} borderRadius="4px" px="4px" py="2px" mr={mr}>
    <Text m="0" p="0" color="white" fontSize="m" fontWeight="bold">
      $
    </Text>
  </Box>
);

const BudgetingIcon = () => (
  <Box display="flex">
    <MoneyIcon mr="4px" />
    <MoneyIcon mr="4px" />
    <MoneyIcon />
  </Box>
);

export default BudgetingIcon;
