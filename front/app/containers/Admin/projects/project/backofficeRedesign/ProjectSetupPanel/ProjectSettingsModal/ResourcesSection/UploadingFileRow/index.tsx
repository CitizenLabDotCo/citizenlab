import React from 'react';

import IconButton from 'design-system/IconButton';
import { ListBoxOption } from 'design-system/ListBox';
import Select from 'design-system/Select';
import Spinner from 'design-system/Spinner';
import Text from 'design-system/Text';

import { FILE_CATEGORIES, FileCategory } from 'api/files/types';

import { UploadStatus } from 'containers/Admin/projects/_shared/fileUploads/types';
import filesMessages from 'containers/Admin/projects/project/files/components/messages';

import { useIntl } from 'utils/cl-intl';

import FileRow from '../FileRow';

import messages from './messages';
import styles from './UploadingFileRow.module.css';
import 'design-system/tokens.css';

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
  const selectFileType = formatMessage(filesMessages.selectFileType);

  return (
    <FileRow
      name={file.name}
      mimeType={file.type}
      meta={
        status === 'too_large' && (
          <Text variant="small" tone="danger">
            {formatMessage(filesMessages.fileSizeError)}
          </Text>
        )
      }
      status={
        <div className={styles.status}>
          {status === 'queued' && (
            <div className={styles.categorySelect}>
              <Select
                aria-label={selectFileType}
                size={32}
                value={category ?? null}
                placeholder={selectFileType}
                onChange={(key) => {
                  const option = FILE_CATEGORIES.find((value) => value === key);
                  if (option) onCategoryChange(option);
                }}
              >
                {FILE_CATEGORIES.map((option) => (
                  <ListBoxOption key={option} id={option}>
                    {formatMessage(filesMessages[option])}
                  </ListBoxOption>
                ))}
              </Select>
            </div>
          )}
          {status === 'uploading' && (
            <>
              <Text as="span" variant="small" tone="secondary">
                {formatMessage(messages.fileUploading)}
              </Text>
              <Spinner aria-label={formatMessage(messages.fileUploading)} />
            </>
          )}
          {status === 'error' && (
            <Text as="span" variant="small" tone="danger">
              {formatMessage(messages.fileUploadFailed)}
            </Text>
          )}
        </div>
      }
      actions={
        status !== 'uploading' && (
          <IconButton
            icon="x-16"
            aria-label={formatMessage(messages.removeFile, {
              fileName: file.name,
            })}
            onPress={onRemove}
          />
        )
      }
    />
  );
};

export default UploadingFileRow;
