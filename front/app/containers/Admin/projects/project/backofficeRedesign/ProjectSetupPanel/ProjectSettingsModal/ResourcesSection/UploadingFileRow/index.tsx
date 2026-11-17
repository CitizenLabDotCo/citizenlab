import React from 'react';

import { FILE_CATEGORIES, FileCategory } from 'api/files/types';

import { UploadStatus } from 'containers/Admin/projects/_shared/fileUploads/types';
import filesMessages from 'containers/Admin/projects/project/files/components/messages';

import IconButton from 'design-system/IconButton';
import { ListBoxOption } from 'design-system/ListBox';
import Select from 'design-system/Select';
import Spinner from 'design-system/Spinner';

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
          <p className={styles.error}>
            {formatMessage(filesMessages.fileSizeError)}
          </p>
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
              <span className={styles.note}>
                {formatMessage(messages.fileUploading)}
              </span>
              <Spinner aria-label={formatMessage(messages.fileUploading)} />
            </>
          )}
          {status === 'error' && (
            <span className={styles.error}>
              {formatMessage(messages.fileUploadFailed)}
            </span>
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
