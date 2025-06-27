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
            <Th>{formatMessage(messages.typeTableHeader)}</Th>
            <Th>{formatMessage(messages.uploaderTableHeader)}</Th>
            <Th>{formatMessage(messages.visibilityTableHeader)}</Th>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {/* Example row, replace with dynamic data when available */}
          <Tr>
            <Td>2025-05-12</Td>
            <Td>example-file.txt</Td>
            <Td>Meeting Notes</Td>
            <Td>Amanda Anderson</Td>
            <Td>Public</Td>
            <Td>
              <MoreActionsMenu showLabel={false} actions={getActions()} />
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </>
  );
};

export default FilesTable;
