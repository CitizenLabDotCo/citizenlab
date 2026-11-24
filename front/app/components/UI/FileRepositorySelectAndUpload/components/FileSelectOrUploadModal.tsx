import React from 'react';

import { Button } from '@citizenlab/cl2-component-library';
import { UploadFile } from 'typings';

import { IFileAttachmentData } from 'api/file_attachments/types';
import { IFileData } from 'api/files/types';

import { useIntl } from 'utils/cl-intl';

import FileSelectModal from './FileSelectModal';
import messages from './messages';

type Props = {
  onFileAdd: (fileToAdd: UploadFile) => void;
  onFileAttach?: (fileToAttach: IFileData) => void;
  fileAttachments?: IFileAttachmentData[];
  maxSizeMb?: number;
  dataCy?: string;
  isDisabled?: boolean;
};

const FileSelectOrUploadModal = ({
  onFileAdd,
  onFileAttach,
  maxSizeMb,
  fileAttachments,
  isDisabled,
  dataCy,
}: Props) => {
  const { formatMessage } = useIntl();
  const [modalOpen, setModalOpen] = React.useState(false);

  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        id={'e2e-open-file-upload-modal-button'}
        buttonStyle="secondary"
        icon="file-add"
        disabled={isDisabled}
      >
        {formatMessage(messages.addFile)}
      </Button>
      <FileSelectModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        onFileAdd={onFileAdd}
        onFileAttach={onFileAttach}
        fileAttachments={fileAttachments}
        maxSizeMb={maxSizeMb}
        dataCy={dataCy}
      />
    </>
  );
};

export default FileSelectOrUploadModal;
