import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

import { IFile } from 'api/files/types';

import { returnFileSize } from 'utils/fileUtils';

type Props = {
  file: IFile;
};
const FileMetadata = ({ file }: Props) => {
  return (
    <Box mt="12px">
      <Box display="flex">
        <Icon
          name="calendar"
          width="16px"
          m="0"
          fill={colors.textSecondary}
          aria-hidden
        />
        <Text m="0" ml="8px" color="textSecondary">
          {new Date(file.data.attributes.created_at).toLocaleDateString()}
        </Text>
      </Box>
      <Box display="flex">
        <Icon name="file" width="16px" m="0" fill={colors.textSecondary} />
        <Text m="0" ml="8px" color="textSecondary">
          {returnFileSize(file.data.attributes.size)}
        </Text>
      </Box>
    </Box>
  );
};

export default FileMetadata;
