import React, { useState } from 'react';

import { CLErrors, UploadFile } from 'typings';

import { IFileAttachmentData } from 'api/file_attachments/types';
import { IFileData } from 'api/files/types';

import useApiErrorText from 'components/admin/MultilocFields/useApiErrorText';
import FileRepositorySelectAndUpload from 'components/UI/FileRepositorySelectAndUpload';
import FileSelectModal from 'components/UI/FileRepositorySelectAndUpload/components/FileSelectModal';
import fileMessages from 'components/UI/FileRepositorySelectAndUpload/components/messages';

import { fieldStyles } from 'design-system/Field';

import { useIntl } from 'utils/cl-intl';

import SetupCard from './SetupCard';
import SummaryPill from './SummaryPill';
import 'design-system/tokens.css';

const MAX_SIZE_MB = 10;

export interface FileAttachments {
  attachments: IFileAttachmentData[];
  isUploadingFile: boolean;
  uploadFile: (file: UploadFile) => void;
  attachFile: (file: IFileData) => void;
  removeFile: (attachment: IFileAttachmentData) => void;
  reorderFiles: (attachments: IFileAttachmentData[]) => void;
}

interface Props {
  id: string;
  title: string;
  files: FileAttachments;
  errors?: CLErrors | null;
  disabled?: boolean;
}

const AttachmentsCard = ({
  id,
  title,
  files,
  errors,
  disabled = false,
}: Props) => {
  const { formatMessage } = useIntl();
  const getApiErrorMessage = useApiErrorText();
  const [opened, setOpened] = useState(false);
  const fileError = opened ? undefined : getApiErrorMessage(errors?.file);
  const hasBody =
    files.attachments.length > 0 || files.isUploadingFile || !!errors?.file;

  return (
    <>
      <SetupCard
        title={title}
        action={
          files.attachments.length > 0 && (
            <SummaryPill
              active
              icon="paperclip-16"
              label={formatMessage(fileMessages.attachmentCount, {
                count: files.attachments.length,
              })}
            />
          )
        }
        button={{
          icon: files.attachments.length > 0 ? 'edit' : 'plus',
          actionLabel: formatMessage(fileMessages.addFile),
          disabled: files.isUploadingFile || disabled,
          onClick: () => setOpened(true),
        }}
      >
        {fileError && <p className={fieldStyles.error}>{fileError}</p>}
      </SetupCard>
      <FileSelectModal
        opened={opened}
        variant="panel"
        onClose={() => setOpened(false)}
        fileAttachments={files.attachments}
        onFileAdd={files.uploadFile}
        onFileAttach={files.attachFile}
        maxSizeMb={MAX_SIZE_MB}
        isUploadingFile={files.isUploadingFile}
      >
        {hasBody && (
          <FileRepositorySelectAndUpload
            id={id}
            variant="panel"
            onFileAdd={files.uploadFile}
            onFileRemove={files.removeFile}
            onFileReorder={files.reorderFiles}
            onFileAttach={files.attachFile}
            fileAttachments={files.attachments}
            apiErrors={errors}
            maxSizeMb={MAX_SIZE_MB}
            isUploadingFile={files.isUploadingFile}
            disabled={disabled}
            hideTrigger
          />
        )}
      </FileSelectModal>
    </>
  );
};

export default AttachmentsCard;
