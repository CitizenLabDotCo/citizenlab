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
} from '@citizenlab/cl2-component-library';

import { IPaginationProps } from 'api/files/types';
import useFiles from 'api/files/useFiles';

import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

const FilesTable = () => {
  const { formatMessage } = useIntl();

  const [queryParameters, setQueryParameters] = useState<IPaginationProps>({
    pageNumber: 1,
    pageSize: 20,
  });

  const { data: files } = useFiles({
    ...queryParameters,
  });

  const editFileHandler = () => {
    // ToDo: Logic to handle file editing
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
    <>
      {files?.data.length && files.data.length > 0 && (
        <Table
          border={`1px solid ${colors.grey300}`}
          borderRadius={stylingConsts.borderRadius}
          innerBorders={{
            bodyRows: true,
          }}
        >
          <Thead>
            <Tr>
              <Th width="100px">{formatMessage(messages.addedTableHeader)}</Th>
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
                  {new Date(file.attributes.created_at).toLocaleDateString()}
                </Td>
                <Td>{file.attributes.name}</Td>
                <Td>{file.attributes.mime_type}</Td>
                <Td>{file.relationships.uploader.id || 'Unknown'}</Td>
                <Td>{file.attributes.deleted_at ? 'Private' : 'Public'}</Td>
                <Td>
                  <MoreActionsMenu showLabel={false} actions={getActions()} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </>
  );
};

export default FilesTable;
