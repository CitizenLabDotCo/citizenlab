import React, { useState } from 'react';

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
  Spinner,
} from '@citizenlab/cl2-component-library';

import useApiClients from 'api/api_clients/useApiClients';
import useDeleteApiClient from 'api/api_clients/useDeleteApiClient';

import GoBackButton from 'components/UI/GoBackButton';
import Modal from 'components/UI/Modal';

import { useIntl, FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import CreateTokenModal from './CreateTokenModal';
import messages from './messages';

const PublicAPITokens = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { formatMessage, formatDate } = useIntl();
  const { mutate: deleteToken } = useDeleteApiClient();
  const { data: apiTokens, isLoading } = useApiClients();

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
      <Box w="100%">
        <GoBackButton onClick={clHistory.goBack} />
      </Box>

      <Title styleVariant="h1">{formatMessage(messages.title)}</Title>
      <Box display="flex" justifyContent={'space-between'} mb="12px">
        <Text>
          <FormattedMessage
            {...messages.description}
            values={{
              link: (
                <a
                  href={formatMessage(messages.linkUrl)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {formatMessage(messages.link)}
                </a>
              ),
            }}
          />
        </Text>
        <Button color={colors.primary} onClick={openTokenModal}>
          {formatMessage(messages.createTokenButton)}
        </Button>
      </Box>
      {isLoading && <Spinner />}
      {apiTokens && apiTokens.data.length > 0 && (
        <Table bgColor="white" data-testid="apiTokensTable">
          <Thead>
            <Tr>
              <Th>{formatMessage(messages.name)}</Th>
              <Th>client_id</Th>
              <Th>client_secret</Th>
              <Th>{formatMessage(messages.createdAt)}</Th>
              <Th>{formatMessage(messages.lastUsedAt)}</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {apiTokens.data.map((token) => (
              <Tr key={token.id}>
                <Td>{token.attributes.name}</Td>
                <Td>{token.id}</Td>
                <Td>{token.attributes.masked_secret}</Td>
                <Td>{formatDate(token.attributes.created_at)}</Td>
                <Td>
                  {token.attributes.last_used_at &&
                    formatDate(token.attributes.last_used_at)}
                </Td>
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
      )}
      {apiTokens && apiTokens.data.length === 0 && (
        <Box display="flex" justifyContent="center" w="100%">
          <Title styleVariant="h3">{formatMessage(messages.noTokens)}</Title>
        </Box>
      )}
      <Modal opened={isModalOpen} close={closeTokenModal}>
        <CreateTokenModal onClose={closeTokenModal} />
      </Modal>
    </>
  );
};

export default PublicAPITokens;
