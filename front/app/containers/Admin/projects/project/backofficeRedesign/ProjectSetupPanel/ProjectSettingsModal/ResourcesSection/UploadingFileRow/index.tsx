import React from 'react';

import {
  Box,
  Button,
  Select,
  Spinner,
  Text,
} from '@citizenlab/cl2-component-library';

import { FILE_CATEGORIES, FileCategory } from 'api/files/types';

import { UploadStatus } from 'containers/Admin/projects/_shared/fileUploads/types';
import messages from 'containers/Admin/projects/project/backofficeRedesign/messages';
import filesMessages from 'containers/Admin/projects/project/files/components/messages';

import { useIntl } from 'utils/cl-intl';

import FileRow from '../FileRow';

interface Props {
  file: File;
  status: UploadStatus;
  category?: FileCategory;
  onCategoryChange: (category: FileCategory) => void;
  onRemove: () => void;
}

const UploadingFileRow = ({
  file,
  status,
  category,
  onCategoryChange,
  onRemove,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <FileRow
      name={file.name}
      mimeType={file.type}
      meta={
        status === 'too_large' && (
          <Text variant="boMicro" color="red600" m="0px">
            {formatMessage(filesMessages.fileSizeError)}
          </Text>
        )
      }
      status={
        <Box flexShrink={0} display="flex" alignItems="center" gap="8px">
          {status === 'queued' && (
            <Box w="180px">
              <Select
                variant="bo"
                value={category ?? null}
                placeholder={formatMessage(filesMessages.selectFileType)}
                options={FILE_CATEGORIES.map((option) => ({
                  value: option,
                  label: formatMessage(filesMessages[option]),
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
          {status === 'error' && (
            <Text variant="boMicro" color="red600" m="0px">
              {formatMessage(messages.fileUploadFailed)}
            </Text>
          )}
        </Box>
      }
      actions={
        status !== 'uploading' && (
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
        )
      }
    />
  );
};

export default UploadingFileRow;
