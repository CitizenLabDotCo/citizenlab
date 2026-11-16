import React, { useState } from 'react';

import useFiles from 'api/files/useFiles';

import useDebouncedValue from 'hooks/useDebouncedValue';

import filesMessages from 'containers/Admin/projects/project/files/components/messages';

import Button from 'design-system/Button';
import Modal from 'design-system/Modal';
import Pagination from 'design-system/Pagination';
import SearchField from 'design-system/SearchField';
import 'design-system/tokens.css';

import { useIntl } from 'utils/cl-intl';

import ManagedFileRow from '../ManagedFileRow';
import messages from '../messages';
import UploadingFileRow from '../UploadingFileRow';
import useFilesCount from '../useFilesCount';
import { FilesDraft } from '../useFilesDraft';

import styles from './ManageFilesModal.module.css';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE = 500;

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
  const [searchText, setSearchText] = useState('');
  const search = useDebouncedValue(searchText, SEARCH_DEBOUNCE) || undefined;
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
    setSearchText(value);
    setPageNumber(1);
  };

  const searchLabel = formatMessage(filesMessages.searchFiles);

  return (
    <Modal
      isOpen={opened}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      title={formatMessage(messages.manageFiles)}
      size={560}
    >
      <div>
        <div className={styles.toolbar}>
          <div className={styles.search}>
            <SearchField
              aria-label={searchLabel}
              placeholder={searchLabel}
              value={searchText}
              onChange={handleSearchChange}
            />
          </div>
          <Button variant="secondary" onPress={onAddFiles}>
            {formatMessage(messages.addFiles)}
          </Button>
        </div>
        {/* Live, so screen readers hear how many files the search found. */}
        <p className={styles.count} aria-live="polite">
          {count > 0
            ? formatMessage(messages.filesCount, { count })
            : formatMessage(filesMessages.noFilesFound)}
        </p>
        <div className={styles.files}>
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
        </div>
        {lastPage > 1 && (
          <div className={styles.pagination}>
            <Pagination
              page={currentPage}
              pageCount={lastPage}
              onChange={setPageNumber}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ManageFilesModal;
