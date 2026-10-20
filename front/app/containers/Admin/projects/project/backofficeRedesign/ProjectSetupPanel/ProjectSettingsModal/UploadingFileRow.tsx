import React from 'react';

import {
  Box,
  Button,
  Icon,
  Select,
  Spinner,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';

import { FILE_CATEGORIES, FileCategory } from 'api/files/types';

import { UploadStatus } from 'containers/Admin/projects/_shared/fileUploads/types';
import messages from 'containers/Admin/projects/project/backofficeRedesign/messages';
import filesMessages from 'containers/Admin/projects/project/files/components/messages';

import { useIntl } from 'utils/cl-intl';
import { returnFileSize } from 'utils/fileUtils';

import FileRow, { FILE_ROW_ACTION_CLASS } from './FileRow';
import { getCategoryMessage, getFileIcon } from './fileUtils';

interface Props {
  file: File;
  status: UploadStatus;
  category?: FileCategory;
  onCategoryChange: (category: FileCategory) => void;
  onRetry: () => void;
  onRemove: () => void;
}

const UploadingFileRow = ({
  file,
  status,
  category,
  onCategoryChange,
  onRetry,
  onRemove,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <FileRow>
      <Icon
        name={getFileIcon(file.type)}
        width="16px"
        height="16px"
        fill={colors.coolGrey500}
      />
      <Box flex="1" minWidth="0">
        <Text
          variant="boControl"
          fontSize="xs"
          m="0px"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {file.name}
        </Text>
        {status === 'too_large' && (
          <Text variant="boMicro" color="red600" m="0px">
            {formatMessage(filesMessages.fileSizeError)}
          </Text>
        )}
      </Box>
      <Box flexShrink={0} display="flex" alignItems="center" gap="8px">
        {status === 'queued' && (
          <Box w="180px">
            <Select
              variant="bo"
              value={category ?? null}
              placeholder={formatMessage(filesMessages.selectFileType)}
              options={FILE_CATEGORIES.map((option) => ({
                value: option,
                label: formatMessage(getCategoryMessage(option)),
              }))}
              onChange={(option) => onCategoryChange(option.value)}
            />
          </Box>
        )}
        {status === 'uploading' && (
          <>
            <Text variant="boMicro" color="coolGrey500" m="0px">
              {formatMessage(messages.fileUploading)}
            </Text>
            <Spinner size="14px" />
          </>
        )}
        {status === 'uploaded' && (
          <Text variant="boMicro" color="coolGrey500" m="0px">
            {returnFileSize(file.size)}
          </Text>
        )}
        {status === 'error' && (
          <>
            <Text variant="boMicro" color="red600" m="0px">
              {formatMessage(messages.fileUploadFailed)}
            </Text>
            <Button
              buttonStyle="bo-text"
              icon="refresh"
              width="28px"
              height="28px"
              padding="0"
              ariaLabel={formatMessage(filesMessages.retryUpload)}
              onClick={onRetry}
            />
          </>
        )}
      </Box>
      <Box flexShrink={0} w="28px" className={FILE_ROW_ACTION_CLASS}>
        {status !== 'uploading' && (
          <Button
            buttonStyle="bo-text"
            icon="close"
            width="28px"
            height="28px"
            padding="0"
            ariaLabel={formatMessage(messages.removeFile, {
              fileName: file.name,
            })}
            onClick={onRemove}
          />
        )}
      </Box>
    </FileRow>
  );
};

export default UploadingFileRow;
