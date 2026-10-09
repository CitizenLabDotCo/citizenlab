import React from 'react';

import {
  Box,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

type Props = {
  content: string | null;
};

const UserMessage = ({ content }: Props) => (
  <Box
    alignSelf="flex-end"
    maxWidth="90%"
    p="12px"
    bgColor={colors.grey100}
    borderRadius={stylingConsts.borderRadius}
  >
    {content && (
      <Text m="0px" whiteSpace="pre-wrap">
        {content}
      </Text>
    )}
  </Box>
);

export default UserMessage;
