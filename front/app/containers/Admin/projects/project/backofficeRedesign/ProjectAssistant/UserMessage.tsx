import React from 'react';

import {
  Box,
  Icon,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

type Props = {
  prompt: string;
  fileNames: string[];
};

const UserMessage = ({ prompt, fileNames }: Props) => (
  <Box
    alignSelf="flex-end"
    maxWidth="90%"
    p="12px"
    bgColor={colors.grey100}
    borderRadius={stylingConsts.borderRadius}
  >
    {prompt && (
      <Text m="0px" whiteSpace="pre-wrap">
        {prompt}
      </Text>
    )}
    {fileNames.map((fileName) => (
      <Box key={fileName} display="flex" alignItems="center" gap="4px" mt="4px">
        <Icon name="paperclip" width="14px" height="14px" fill={colors.grey700} />
        <Text m="0px" fontSize="s" color="grey700">
          {fileName}
        </Text>
      </Box>
    ))}
  </Box>
);

export default UserMessage;
