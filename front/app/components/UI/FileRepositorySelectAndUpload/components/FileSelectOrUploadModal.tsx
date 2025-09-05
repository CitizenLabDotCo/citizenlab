import React from 'react';

import { Button } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import { UploadFile } from 'typings';

import { IFileAttachmentData } from 'api/file_attachments/types';
import { IFileData } from 'api/files/types';
import useFiles from 'api/files/useFiles';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import FileInput from '../FileInput';

import messages from './messages';

type Props = {
  id: string;
  onFileAdd: (fileToAdd: UploadFile) => void;
  handleFileOnAttach?: (fileToAttach: IFileData) => void;
  fileAttachments?: IFileAttachmentData[];
  maxSizeMb?: number;
  dataCy?: string;
};

const FileSelectOrUploadModal = ({
  id,
  onFileAdd,
  handleFileOnAttach,
  maxSizeMb,
  fileAttachments,
  dataCy,
}: Props) => {
  const { formatMessage } = useIntl();

  const { projectId } = useParams();

  const { data: files } = useFiles({
    project: [projectId || ''],
    enabled: !!projectId,
  });

  const [modalOpen, setModalOpen] = React.useState(false);

  const handleFileOnAdd = (fileToAdd: UploadFile) => {
    onFileAdd(fileToAdd);
    setModalOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        buttonStyle="secondary"
        icon="file-add"
      >
        {formatMessage(messages.addFile)}
      </Button>
      <Modal
        closeOnClickOutside={true}
        close={() => setModalOpen(false)}
        opened={modalOpen}
      >
        <FileInput
          onAdd={handleFileOnAdd}
          id={id}
          multiple={false}
          maxSizeMb={maxSizeMb}
          dataCy={dataCy}
        />
      </Modal>
    </>
  );
};

export default FileSelectOrUploadModal;
