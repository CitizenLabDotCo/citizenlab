import React, { useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import Modal from '../Modal';

import SelectExistingFile from './components/SelectExistingFile';
import { FileType } from './FileDisplay';
import messages from './messages';

type Props = {
  files?: FileType[];
  onFileAddFromRepository?: (files: FileType[]) => void;
};
const DataRepositoryFileSelector = ({
  onFileAddFromRepository,
  files,
}: Props) => {
  const { formatMessage } = useIntl();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button
        buttonStyle="secondary-outlined"
        m="0px"
        icon="folder-solid"
        onClick={() => setModalOpen(true)}
      >
        {formatMessage(messages.chooseFromExistingFiles)}
      </Button>
      <Modal
        opened={modalOpen}
        close={() => setModalOpen(false)}
        header={formatMessage(messages.chooseFromExistingFiles)}
      >
        <Box p="24px">
          <SelectExistingFile
            attachedFiles={files}
            onFileAddFromRepository={(files) => {
              onFileAddFromRepository?.(files);
              setModalOpen(false);
            }}
          />
        </Box>
      </Modal>
    </>
  );
};

export default DataRepositoryFileSelector;
