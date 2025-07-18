import React from 'react';

import {
  Box,
  Button,
  colors,
  IconButton,
  Tooltip,
} from '@citizenlab/cl2-component-library';

import { IFileData } from 'api/files/types';

import { useIntl } from 'utils/cl-intl';
import { saveFileToDisk } from 'utils/fileUtils';

import messages from '../messages';

type Props = {
  file: IFileData;
  variant?: 'button-text' | 'icon';
};

const DownloadFileButton = ({ file, variant = 'button-text' }: Props) => {
  const { formatMessage } = useIntl();

  if (variant === 'icon') {
    return (
      <Box display="flex">
        <Tooltip content={formatMessage(messages.downloadFile)}>
          <IconButton
            mt="3px"
            iconHeight="22px"
            iconName="download"
            onClick={() => saveFileToDisk(file)}
            a11y_buttonActionMessage={formatMessage(messages.downloadFile)}
            iconColor={colors.coolGrey600}
          />
        </Tooltip>
      </Box>
    );
  }
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
