import React from 'react';

import {
  Box,
  Icon,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import { IFileAttachmentData } from 'api/file_attachments/types';
import useFileById from 'api/files/useFileById';

interface Props {
  attachment: IFileAttachmentData;
}

const PreviewAttachment = ({ attachment }: Props) => {
  const { data: file } = useFileById(attachment.relationships.file.data.id);

  if (!file) return null;

  return (
    <Box
      display="flex"
      alignItems="center"
      gap="16px"
      p="14px 16px"
      border={`1px solid ${colors.divider}`}
      borderRadius={stylingConsts.borderRadius}
    >
      <Icon
        name="paperclip"
        width="18px"
        height="18px"
        fill={colors.coolGrey600}
      />
      <Text
        m="0"
        fontSize="s"
        lineHeight="20px"
        color="coolGrey700"
        textDecoration="underline"
      >
        {file.data.attributes.name}
      </Text>
    </Box>
  );
};

export default PreviewAttachment;
