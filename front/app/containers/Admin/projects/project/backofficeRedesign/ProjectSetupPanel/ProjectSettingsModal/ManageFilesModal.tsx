import React, { useState } from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import useFiles from 'api/files/useFiles';

import messages from 'containers/Admin/projects/project/backofficeRedesign/messages';
import filesMessages from 'containers/Admin/projects/project/files/components/messages';

import Modal from 'components/UI/Modal';
import SearchInput from 'components/UI/SearchInput';

import { useIntl } from 'utils/cl-intl';

import { FILE_MODAL_HEIGHT } from './FileRow';
import ManagedFileRow from './ManagedFileRow';

interface Props {
  projectId: string;
  opened: boolean;
  onClose: () => void;
  onAddFiles: () => void;
}

const ManageFilesModal = ({
  projectId,
  opened,
  onClose,
  onAddFiles,
}: Props) => {
  const { formatMessage } = useIntl();
  const [search, setSearch] = useState<string | undefined>();
  const { data: files } = useFiles({
    project: [projectId],
    sort: '-created_at',
    search,
  });

  const count = files?.data.length ?? 0;

  return (
    <Modal
      variant="bo"
      opened={opened}
      close={onClose}
      width={560}
      height={FILE_MODAL_HEIGHT}
      header={formatMessage(messages.manageFiles)}
    >
      <Box p="24px">
        <Box display="flex" alignItems="center" gap="8px">
          <Box flex="1">
            <SearchInput
              placeholder={formatMessage(filesMessages.searchFiles)}
              onChange={(value) => setSearch(value || undefined)}
              a11y_numberOfSearchResults={count}
              variant="bo"
              hideLabel
            />
          </Box>
          <Button buttonStyle="bo-secondary" width="auto" onClick={onAddFiles}>
            {formatMessage(messages.addFiles)}
          </Button>
        </Box>
        <Text variant="boMicro" color="coolGrey500" mt="16px" mb="4px">
          {count > 0
            ? formatMessage(messages.filesCount, { count })
            : formatMessage(filesMessages.noFilesFound)}
        </Text>
        <Box mx="-8px">
          {files?.data.map((file) => (
            <ManagedFileRow key={file.id} file={file} />
          ))}
        </Box>
      </Box>
    </Modal>
  );
};

export default ManageFilesModal;
