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

import { IPaginationProps } from 'api/files/types';
import useFiles from 'api/files/useFiles';

import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import SearchInput from 'components/UI/SearchInput';
import UserName from 'components/UI/UserName';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import FileSideView from './FileSideView';
import FileUploadWithDropzone from './FileUploadWithDropzone';
import messages from './messages';
import UploadFileButtonWithModal from './UploadFileButtonWithModal';

const FilesTable = () => {
  const { formatMessage } = useIntl();
  const [sideViewOpened, setSideViewOpened] = useState(false);

  const [queryParameters, _setQueryParameters] = useState<IPaginationProps>({
    pageNumber: 1,
    pageSize: 1,
  });

  const { data: files } = useFiles({
    ...queryParameters,
  });

  const editFileHandler = () => {
    // ToDo: Logic to handle file editing
    setSideViewOpened(true);
  };

  const deleteFileHandler = () => () => {
    // ToDo: Logic to handle file deletion
  };

  const getActions = (): IAction[] => [
    {
      label: <FormattedMessage {...messages.editFile} />,
      handler: editFileHandler,
      name: 'edit',
    },
    {
      label: <FormattedMessage {...messages.deleteFile} />,
      handler: deleteFileHandler,
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
                    <Td>{file.attributes.mime_type}</Td>
                    <Td>
                      {file.relationships.uploader.data.id && (
                        <UserName
                          userId={file.relationships.uploader.data.id}
                          fontSize={14}
                          color={colors.blue500}
                        />
                      )}
                    </Td>
                    <Td>{file.attributes.deleted_at ? 'Private' : 'Public'}</Td>
                    <Td>
                      <MoreActionsMenu
                        showLabel={false}
                        actions={getActions()}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          <FileSideView
            opened={sideViewOpened}
            setSideViewOpened={setSideViewOpened}
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
