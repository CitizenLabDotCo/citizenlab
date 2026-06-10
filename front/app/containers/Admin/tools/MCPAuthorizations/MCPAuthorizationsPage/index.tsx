import React from 'react';

import {
  Title,
  Text,
  Table,
  Thead,
  Th,
  Tbody,
  Tr,
  Td,
  Button,
  Box,
  Spinner,
  colors,
} from '@citizenlab/cl2-component-library';

import useMCPAuthorizations from 'api/mcp_authorizations/useMCPAuthorizations';
import useRevokeMCPAuthorization from 'api/mcp_authorizations/useRevokeMCPAuthorization';

import GoBackButton from 'components/UI/GoBackButton';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

const MCPAuthorizationsPage = () => {
  const { formatMessage, formatDate } = useIntl();
  const { data: authorizations, isLoading } = useMCPAuthorizations();
  const { mutate: revokeAuthorization } = useRevokeMCPAuthorization();

  const handleRevoke = (id: string) => {
    if (window.confirm(formatMessage(messages.revokeConfirmation))) {
      revokeAuthorization(id);
    }
  };

  return (
    <>
      <Box w="100%">
        <GoBackButton onClick={clHistory.goBack} />
      </Box>

      <Title variant="h1">{formatMessage(messages.pageTitle)}</Title>
      <Text mb="24px">{formatMessage(messages.pageDescription)}</Text>

      {isLoading && <Spinner />}

      {authorizations && authorizations.data.length > 0 && (
        <Table bgColor="white" data-testid="mcpAuthorizationsTable">
          <Thead>
            <Tr>
              <Th>{formatMessage(messages.clientName)}</Th>
              <Th>{formatMessage(messages.clientId)}</Th>
              <Th>{formatMessage(messages.authorizedOn)}</Th>
              <Th>{formatMessage(messages.status)}</Th>
              <Th>{formatMessage(messages.actions)}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {authorizations.data.map((authorization) => (
              <Tr key={authorization.id}>
                <Td>{authorization.attributes.client_name}</Td>
                <Td>{authorization.attributes.client_id}</Td>
                <Td>{formatDate(authorization.attributes.authorized_at)}</Td>
                <Td>
                  <Box
                    as="span"
                    display="inline-block"
                    px="8px"
                    py="2px"
                    borderRadius="4px"
                    background={colors.successLight}
                  >
                    <Text as="span" m="0px" variant="bodyS" color="success">
                      {formatMessage(messages.statusActive)}
                    </Text>
                  </Box>
                </Td>
                <Td>
                  <Button
                    buttonStyle="secondary-outlined"
                    icon="delete"
                    textColor={colors.red500}
                    borderColor={colors.red500}
                    iconColor={colors.red500}
                    onClick={() => handleRevoke(authorization.id)}
                  >
                    {formatMessage(messages.revokeAccess)}
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {authorizations && authorizations.data.length === 0 && (
        <Box display="flex" justifyContent="center" w="100%">
          <Title variant="h3">{formatMessage(messages.noAuthorizations)}</Title>
        </Box>
      )}
    </>
  );
};

export default MCPAuthorizationsPage;
