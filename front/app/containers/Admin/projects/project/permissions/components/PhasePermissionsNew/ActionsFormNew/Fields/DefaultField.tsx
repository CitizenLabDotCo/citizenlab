import React from 'react';

import {
  Box,
  stylingConsts,
  Text,
  Toggle,
} from '@citizenlab/cl2-component-library';

interface Props {
  fieldName: string;
}

const noop = () => {};

const DefaultField = ({ fieldName }: Props) => {
  return (
    <Box
      py="18px"
      borderTop={stylingConsts.border}
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Text m="0" fontSize="m" color="primary">
        {fieldName}
      </Text>
      <Box>
        <Box
          mb="-4px" // cancel out te bottom margin of the Toggle
        >
          <Toggle checked onChange={noop} />
        </Box>
      </Box>
    </Box>
  );
};

export default DefaultField;
