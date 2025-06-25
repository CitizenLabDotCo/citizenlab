import React, { useState } from 'react';

import {
  colors,
  stylingConsts,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Box,
} from '@citizenlab/cl2-component-library';

import { IPaginationProps, QueryParameters } from 'api/files/types';
import useDeleteFile from 'api/files/useDeleteFile';
import useFiles from 'api/files/useFiles';

import Pagination from 'components/Pagination';
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import SearchInput from 'components/UI/SearchInput';
import UserName from 'components/UI/UserName';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import FileSideView from './FileSideView';
import FileUploadWithDropzone from './FileUploadWithDropzone';
import messages from './messages';
import UploadFileButtonWithModal from './UploadFileButtonWithModal';

const FilesTable = () => {
  const { formatMessage } = useIntl();
  const [sideViewOpened, setSideViewOpened] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const [queryParameters, setQueryParameters] = useState<
    QueryParameters & IPaginationProps
  >({
    pageNumber: 1,
    pageSize: 8,
    sort: 'created_at',
  });

  const { data: files } = useFiles({
    ...queryParameters,
  });
  const { mutate: deleteFile } = useDeleteFile();

  const currentPage = getPageNumberFromUrl(files?.links.self || '');
  const lastPage = getPageNumberFromUrl(files?.links.last || '');

  const handlePaginationClick = (pageNumber: number) => {
    setQueryParameters((prevParams) => ({
      ...prevParams,
      pageNumber,
    }));
  };

  const editFileHandler = (fileId: string) => () => {
    // ToDo: Logic to handle file editing
    setSideViewOpened(true);
    setSelectedFileId(fileId);
  };

  const deleteFileHandler = (fileId: string) => () => {
    confirm(formatMessage(messages.confirmDelete)) &&
      deleteFile(fileId, {
        onError: (_error) => {
          // ToDo: Handle any file deletion errors.
        },
      });
  };

  const getActions = (fileId: string): IAction[] => [
    {
      label: <FormattedMessage {...messages.editFile} />,
      handler: editFileHandler(fileId),
      name: 'edit',
    },
    {
      label: <FormattedMessage {...messages.deleteFile} />,
      handler: deleteFileHandler(fileId),
      name: 'delete',
    },
  ];

  return (
    <Box display="flex" justifyContent="center" flexDirection="column">
      {files?.data.length && files.data.length > 0 ? (
        <>
          <Box display="flex" justifyContent="space-between">
            <SearchInput
              placeholder={formatMessage(messages.searchFiles)}
              onChange={() => {}} // TODO: Implement file search functionality.
              a11y_numberOfSearchResults={0}
            />
            <UploadFileButtonWithModal />
          </Box>
          <Box mt="40px" background={colors.white}>
            <Table
              border={`1px solid ${colors.grey300}`}
              borderRadius={stylingConsts.borderRadius}
              innerBorders={{
                bodyRows: true,
              }}
            >
              <Thead>
                <Tr>
                  <Th width="100px">
                    {formatMessage(messages.addedTableHeader)}
                  </Th>
                  <Th width="60%">{formatMessage(messages.fileTableHeader)}</Th>
                  <Th>{formatMessage(messages.typeTableHeader)}</Th>
                  <Th>{formatMessage(messages.uploaderTableHeader)}</Th>
                  <Th>{formatMessage(messages.visibilityTableHeader)}</Th>
                  <Th />
                </Tr>
              </Thead>
              <Tbody>
                {files.data.map((file) => (
                  <Tr key={file.id}>
                    <Td>
                      {new Date(
                        file.attributes.created_at
                      ).toLocaleDateString()}
                    </Td>
                    <Td>{file.attributes.name}</Td>
                    <Td>
                      {file.attributes.mime_type ||
                        formatMessage(messages.unknown)}
                    </Td>
                    <Td>
                      {file.relationships.uploader.data.id && (
                        <UserName
                          userId={file.relationships.uploader.data.id}
                          fontSize={14}
                          color={colors.blue500}
                        />
                      )}
                    </Td>
                    <Td>{'ToDo'}</Td>
                    <Td>
                      <MoreActionsMenu
                        showLabel={false}
                        actions={getActions(file.id)}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Box display="flex" justifyContent="center" my="8px">
              <Pagination
                currentPage={currentPage || 1}
                totalPages={lastPage || 1}
                loadPage={handlePaginationClick}
              />
            </Box>
          </Box>
          <FileSideView
            opened={sideViewOpened}
            setSideViewOpened={setSideViewOpened}
            selectedFileId={selectedFileId}
          />
        </>
      ) : (
        <Box
          borderRadius={stylingConsts.borderRadius}
          background="white"
          width="500px"
          p="40px"
          mt="60px"
          mx="auto"
        >
          <FileUploadWithDropzone />
        </Box>
      )}
    </Box>
  );
};

export default FilesTable;
