import React from 'react';

import {
  Box,
  Button,
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
      <Box display="flex" flexDirection="row">
        <Button
          icon="edit"
          buttonStyle="text"
          p="0"
          m="0"
          mr="22px"
          onClick={noop}
        >
          Edit
        </Button>
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
