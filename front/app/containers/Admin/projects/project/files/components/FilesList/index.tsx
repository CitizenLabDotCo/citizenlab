import React, { useState } from 'react';

import { Box, Spinner, Text } from '@citizenlab/cl2-component-library';

import { GetFilesParameters } from 'api/files/types';
import useFiles from 'api/files/useFiles';

import Pagination from 'components/Pagination';
import SearchInput from 'components/UI/SearchInput';

import { useIntl } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import { useParams } from 'utils/router';

import FeatureInformation from '../FeatureInformation';
import FileSideView from '../FileSideView';
import messages from '../messages';
import UploadFileButtonWithModal from '../UploadFileButtonWithModal';

import FilesListItem from './components/FilesListItem';

const FilesList = () => {
  const { formatMessage } = useIntl();
  const [sideViewOpened, setSideViewOpened] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const { projectId } = useParams({
    from: '/$locale/admin/projects/$projectId/files',
  });

  const [queryParameters, setQueryParameters] = useState<GetFilesParameters>({
    pageNumber: 1,
    pageSize: 7,
    sort: '-created_at',
    project: [projectId],
  });

  const {
    data: files,
    isFetched,
    isFetching,
  } = useFiles({
    ...queryParameters,
  });

  const numberOfFiles = files?.data.length || 0;

  const currentPage = getPageNumberFromUrl(files?.links.self || '');
  const lastPage = getPageNumberFromUrl(files?.links.last || '');

  const handlePaginationClick = (pageNumber: number) => {
    setQueryParameters((prevParams) => ({
      ...prevParams,
      pageNumber,
    }));
  };

  const handleSearchChange = (searchTerm: string) => {
    setQueryParameters((prevParams) => ({
      ...prevParams,
      search: searchTerm,
      pageNumber: 1, // Reset to first page on new search
    }));
  };

  return (
    <Box display="flex" justifyContent="center" flexDirection="column">
      <>
        <Box display="flex" justifyContent="space-between">
          <SearchInput
            placeholder={formatMessage(messages.searchFiles)}
            onChange={handleSearchChange}
            a11y_numberOfSearchResults={numberOfFiles}
          />
          <UploadFileButtonWithModal />
        </Box>
        <Box mt="40px" display="flex" gap="20px" justifyContent="space-between">
          <Box
            display="flex"
            flexDirection="column"
            width="100%"
            minHeight={lastPage && lastPage > 1 ? '66vh' : 'auto'}
          >
            {numberOfFiles > 0 && (
              <>
                {files?.data.map((file) => (
                  <FilesListItem
                    file={file}
                    setSelectedFileId={setSelectedFileId}
                    setSideViewOpened={setSideViewOpened}
                    key={file.id}
                  />
                ))}
              </>
            )}
            {isFetching && (
              <Box display="flex" width="100%" justifyContent="center">
                <Spinner />
              </Box>
            )}
            {numberOfFiles === 0 && isFetched && (
              <>
                <Box display="flex" width="100%" justifyContent="center">
                  <Text color="coolGrey600">
                    {formatMessage(messages.noFilesFound)}
                  </Text>
                </Box>
              </>
            )}
            {lastPage && lastPage > 1 && (
              <Box mt="auto" display="flex" justifyContent="center" p="12px">
                <Pagination
                  currentPage={currentPage || 1}
                  totalPages={lastPage || 1}
                  loadPage={handlePaginationClick}
                />
              </Box>
            )}
          </Box>
          <Box>
            <FeatureInformation />
          </Box>
        </Box>
        <FileSideView
          opened={sideViewOpened}
          setSideViewOpened={setSideViewOpened}
          selectedFileId={selectedFileId}
        />
      </>
    </Box>
  );
};

export default FilesList;
