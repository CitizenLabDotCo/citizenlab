import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

import useFileById from 'api/files/useFileById';

type Props = {
  fileId: string;
};

const AttachedFileName = ({ fileId }: Props) => {
  const { data: file } = useFileById(fileId);

  if (!file) return null;

  return (
    <Box display="flex" alignItems="center" gap="4px" mt="4px">
      <Icon name="paperclip" width="14px" height="14px" fill={colors.grey700} />
      <Text m="0px" fontSize="s" color="grey700">
        {file.data.attributes.name}
      </Text>
    </Box>
  );
};

export default AttachedFileName;
