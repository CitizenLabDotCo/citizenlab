import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import { IFileData } from 'api/files/types';

import { useIntl } from 'utils/cl-intl';
import { saveFileToDisk } from 'utils/fileUtils';

import messages from '../messages';

type Props = {
  file: IFileData;
};

const DownloadFileButton = ({ file }: Props) => {
  const { formatMessage } = useIntl();
  return (
    <Box display="flex">
      <Button
        mt="12px"
        buttonStyle="admin-dark"
        onClick={() => saveFileToDisk(file)}
        text={formatMessage(messages.downloadFile)}
        fontSize="s"
        p="4px 8px"
      />
    </Box>
  );
};

export default DownloadFileButton;
