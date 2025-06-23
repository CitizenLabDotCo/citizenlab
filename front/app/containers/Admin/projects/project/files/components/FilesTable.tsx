import React from 'react';

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

import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

const FilesTable = () => {
  const { formatMessage } = useIntl();

  const editFileHandler = () => {
    // Logic to handle file editing
    console.log('Edit file handler called');
  };

  const deleteFileHandler = (fileId: string) => () => {
    // Logic to handle file deletion
    console.log(`Delete file handler called for file ID: ${fileId}`);
  };

  const getActions = (fileId: string): IAction[] => [
    {
      label: <FormattedMessage {...messages.editFile} />,
      handler: editFileHandler,
      name: 'edit',
    },
    {
      label: <FormattedMessage {...messages.deleteFile} />,
      handler: deleteFileHandler(fileId),
      name: 'delete',
    },
  ];

  return (
    <>
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
            <Th width="60%">{formatMessage(messages.fileTableHeader)}</Th>{' '}
            {/* Set width here */}
            <Th>{formatMessage(messages.typeTableHeader)}</Th>
            <Th>{formatMessage(messages.uploaderTableHeader)}</Th>
            <Th>{formatMessage(messages.visibilityTableHeader)}</Th>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>2025-05-12</Td>
            <Td>example-file.txt</Td>
            <Td>Meeting Notes</Td>
            <Td>Amanda Anderson</Td>
            <Td>Public</Td>
            <Td>
              <MoreActionsMenu showLabel={false} actions={getActions('test')} />
            </Td>
          </Tr>
          <Tr>
            <Td>2025-05-16</Td>
            <Td>example-file.txt</Td>
            <Td>Report</Td>
            <Td>Simon Jacobsson</Td>
            <Td>Private</Td>
            <Td>
              <MoreActionsMenu showLabel={false} actions={getActions('test')} />
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </>
  );
};

export default FilesTable;
