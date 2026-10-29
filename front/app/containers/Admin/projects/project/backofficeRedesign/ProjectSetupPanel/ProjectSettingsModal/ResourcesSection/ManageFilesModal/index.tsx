import React, { useState } from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import useFiles from 'api/files/useFiles';

import messages from 'containers/Admin/projects/project/backofficeRedesign/messages';
import filesMessages from 'containers/Admin/projects/project/files/components/messages';

import Pagination from 'components/Pagination';
import Modal from 'components/UI/Modal';
import SearchInput from 'components/UI/SearchInput';

import { useIntl } from 'utils/cl-intl';

import { FILE_MODAL_HEIGHT } from '../FileRow';
import ManagedFileRow from '../ManagedFileRow';
import UploadingFileRow from '../UploadingFileRow';
import useFilesCount from '../useFilesCount';
import { FilesDraft } from '../useFilesDraft';

const PAGE_SIZE = 20;

interface Props {
  projectId: string;
  draft: FilesDraft;
  opened: boolean;
  onClose: () => void;
  onAddFiles: () => void;
}

const ManageFilesModal = ({
  projectId,
  draft,
  opened,
  onClose,
  onAddFiles,
}: Props) => {
  const { formatMessage } = useIntl();
  const [search, setSearch] = useState<string | undefined>();
  const [pageNumber, setPageNumber] = useState(1);
  const savedCount = useFilesCount(projectId, search) ?? 0;
  const lastPage = Math.max(1, Math.ceil(savedCount / PAGE_SIZE));
  // Deleting files can remove the page we were on.
  const currentPage = Math.min(pageNumber, lastPage);
  const { data: files } = useFiles({
    project: [projectId],
    sort: '-created_at',
    search,
    pageNumber: currentPage,
    pageSize: PAGE_SIZE,
  });

  // Files not saved yet only exist here, so the server search can't find them.
  const newFiles = search ? [] : draft.uploads;
  const savedFiles = (files?.data ?? []).filter(
    ({ id }) => !draft.deletedIds.includes(id)
  );
  const removedCount = search
    ? (files?.data.length ?? 0) - savedFiles.length
    : draft.deletedIds.length;
  const count = savedCount + newFiles.length - removedCount;

  const handleSearchChange = (value: string) => {
    setSearch(value || undefined);
    setPageNumber(1);
  };

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
              onChange={handleSearchChange}
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
          {newFiles.map(({ key, file, status, category }) => (
            <UploadingFileRow
              key={key}
              file={file}
              status={status}
              category={category}
              onCategoryChange={(category) => draft.setCategory(key, category)}
              onRemove={() => draft.removeUpload(key)}
            />
          ))}
          {savedFiles.map((file) => (
            <ManagedFileRow
              key={file.id}
              file={file}
              onDelete={() => draft.removeFile(file.id)}
            />
          ))}
        </Box>
        {lastPage > 1 && (
          <Box display="flex" justifyContent="center" mt="16px">
            <Pagination
              currentPage={currentPage}
              totalPages={lastPage}
              loadPage={setPageNumber}
            />
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default ManageFilesModal;
