import React from 'react';

import {
  Box,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import AttachedFileName from './AttachedFileName';

type Props = {
  content: string | null;
  fileIds: string[];
};

const UserMessage = ({ content, fileIds }: Props) => (
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
    {fileIds.map((fileId) => (
      <AttachedFileName key={fileId} fileId={fileId} />
    ))}
  </Box>
);

export default UserMessage;
