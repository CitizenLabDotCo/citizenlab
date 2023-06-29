import React, { useState } from 'react';
import { useIntl } from 'utils/cl-intl';
import {
  Title,
  Text,
  Table,
  Thead,
  Th,
  Tbody,
  Tr,
  Td,
  IconButton,
  colors,
  Button,
  Box,
} from '@citizenlab/cl2-component-library';
import messages from './messages';
import useDeleteApiClient from 'api/api_clients/useDeleteApiClient';
import CreateTokenModal from './CreateTokenModal';
import Modal from 'components/UI/Modal';

const apiTokens = {
  data: [
    {
      type: 'public_api_tokens',
      id: '1',
      attributes: {
        name: 'My first API token',
        masked_secret: '********',
        created_at: '2021-03-18T09:00:00.000Z',
        last_used_at: '2021-03-18T09:00:00.000Z',
      },
    },
  ],
};

const PublicAPITokens = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { formatMessage, formatDate } = useIntl();
  const { mutate: deleteToken } = useDeleteApiClient();

  const handleDeleteToken = (id: string) => {
    if (window.confirm(formatMessage(messages.deleteConfirmation))) {
      deleteToken(id);
    }
  };

  const openTokenModal = () => {
    setIsModalOpen(true);
  };

  const closeTokenModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Title>{formatMessage(messages.title)}</Title>
      <Box display="flex" justifyContent={'space-between'} mb="12px">
        <Text>{formatMessage(messages.description)}</Text>
        <Button color={colors.primary} onClick={openTokenModal}>
          {formatMessage(messages.createTokenButton)}
        </Button>
      </Box>
      {apiTokens.data.length > 0 ? (
        <Table bgColor="white">
          <Thead>
            <Tr>
              <Th>{formatMessage(messages.name)}</Th>
              <Th>{formatMessage(messages.secret)}</Th>
              <Th>{formatMessage(messages.createdAt)}</Th>
              <Th>{formatMessage(messages.lastUsedAt)}</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {apiTokens.data.map((token) => (
              <Tr key={token.id}>
                <Td>{token.attributes.name}</Td>
                <Td>{token.attributes.masked_secret}</Td>
                <Td>{formatDate(token.attributes.created_at)}</Td>
                <Td>{formatDate(token.attributes.last_used_at)}</Td>
                <Td>
                  <IconButton
                    iconName="delete"
                    iconColor={colors.red500}
                    iconColorOnHover={colors.red500}
                    onClick={() => handleDeleteToken(token.id)}
                    a11y_buttonActionMessage={formatMessage(messages.delete)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <Text>{formatMessage(messages.noTokens)}</Text>
      )}
      <Modal opened={isModalOpen} close={closeTokenModal}>
        <CreateTokenModal onClose={closeTokenModal} />
      </Modal>
    </>
  );
};

export default PublicAPITokens;
