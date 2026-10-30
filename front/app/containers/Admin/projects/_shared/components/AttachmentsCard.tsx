import React, { useState } from 'react';

import { CLErrors, UploadFile } from 'typings';

import { IFileAttachmentData } from 'api/file_attachments/types';
import { IFileData } from 'api/files/types';

import FileRepositorySelectAndUpload from 'components/UI/FileRepositorySelectAndUpload';
import FileSelectModal from 'components/UI/FileRepositorySelectAndUpload/components/FileSelectModal';
import fileMessages from 'components/UI/FileRepositorySelectAndUpload/components/messages';

import { useIntl } from 'utils/cl-intl';

import SetupCard from './SetupCard';

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
  const [opened, setOpened] = useState(false);
  const hasBody =
    files.attachments.length > 0 || files.isUploadingFile || !!errors?.file;

  return (
    <>
      <SetupCard
        title={title}
        button={{
          icon: 'plus',
          actionLabel: formatMessage(fileMessages.addFile),
          disabled: files.isUploadingFile || disabled,
          onClick: () => setOpened(true),
        }}
      >
        {hasBody && (
          <FileRepositorySelectAndUpload
            id={id}
            variant="bo"
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
      </SetupCard>
      <FileSelectModal
        opened={opened}
        onClose={() => setOpened(false)}
        fileAttachments={files.attachments}
        onFileAdd={files.uploadFile}
        onFileAttach={files.attachFile}
        maxSizeMb={MAX_SIZE_MB}
      />
    </>
  );
};

export default AttachmentsCard;
