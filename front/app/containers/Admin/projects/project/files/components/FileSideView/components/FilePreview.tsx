import React from 'react';

import { Box, Label } from '@citizenlab/cl2-component-library';

import { IFile } from 'api/files/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

type Props = {
  file: IFile;
};
const FilePreview = ({ file }: Props) => {
  const { formatMessage } = useIntl();
  return (
    <Box>
      <Label>{formatMessage(messages.filePreviewLabel)}</Label>
      {/* TODO: implement file preview. */}
      {file.data.attributes.name}
    </Box>
  );
};

export default FilePreview;
