import React, { useState } from 'react';

import {
  Box,
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
  Spinner,
  Badge,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useReplayDelivery from 'api/webhook_deliveries/useReplayDelivery';
import useWebhookDeliveries from 'api/webhook_deliveries/useWebhookDeliveries';
import useWebhookSubscription from 'api/webhook_subscriptions/useWebhookSubscription';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';

type DeliveriesModalProps = {
  subscriptionId: string;
  onClose: () => void;
};

const CodeBlock = styled.pre`
  background-color: ${colors.grey100};
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const DeliveriesModal = ({ subscriptionId }: DeliveriesModalProps) => {
  const { data: subscription } = useWebhookSubscription(subscriptionId);
  const { data: deliveries, isLoading } = useWebhookDeliveries({
    subscriptionId,
  });
  const { mutate: replayDelivery } = useReplayDelivery();
  const { formatMessage, formatDate } = useIntl();
  const [expandedDeliveryId, setExpandedDeliveryId] = useState<string | null>(
    null
  );

  const handleReplay = (deliveryId: string) => {
    replayDelivery(deliveryId);
  };

  const toggleDetails = (deliveryId: string) => {
    setExpandedDeliveryId((prev) => (prev === deliveryId ? null : deliveryId));
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      success: colors.success,
      failed: colors.error,
      pending: colors.grey100,
    };

    return (
      <Badge color={statusColors[status] || colors.grey500}>
        {formatMessage(
          messages[status] || { id: status, defaultMessage: status }
        )}
      </Badge>
    );
  };

  return (
    <Box w="100%" m="24px auto" pr="24px" maxHeight="80vh" overflowY="auto">
      <Title variant="h2">
        <FormattedMessage
          {...messages.deliveriesTitle}
          values={{
            name: subscription?.data.attributes.name || '',
          }}
        />
      </Title>
      <Text mb="20px">{formatMessage(messages.deliveriesDescription)}</Text>

      {isLoading && <Spinner />}

      {deliveries && deliveries.data.length === 0 && (
        <Box display="flex" justifyContent="center" w="100%">
          <Title variant="h3">{formatMessage(messages.noDeliveries)}</Title>
        </Box>
      )}

      {deliveries && deliveries.data.length > 0 && (
        <Table bgColor="white" data-testid="webhookDeliveriesTable">
          <Thead>
            <Tr>
              <Th>{formatMessage(messages.status)}</Th>
              <Th>{formatMessage(messages.eventType)}</Th>
              <Th>{formatMessage(messages.attempts)}</Th>
              <Th>{formatMessage(messages.responseCode)}</Th>
              <Th>{formatMessage(messages.createdAt)}</Th>
              <Th>{formatMessage(messages.actions)}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {deliveries.data.map((delivery) => {
              const isExpanded = expandedDeliveryId === delivery.id;

              return (
                <React.Fragment key={delivery.id}>
                  <Tr>
                    <Td>{getStatusBadge(delivery.attributes.status)}</Td>
                    <Td>{delivery.attributes.event_type}</Td>
                    <Td>{delivery.attributes.attempts}</Td>
                    <Td>{delivery.attributes.response_code || '-'}</Td>
                    <Td>{formatDate(delivery.attributes.created_at)}</Td>
                    <Td>
                      <Box display="flex" gap="8px">
                        <IconButton
                          iconName={isExpanded ? 'chevron-up' : 'chevron-down'}
                          iconColor={colors.primary}
                          iconColorOnHover={colors.primary}
                          onClick={() => toggleDetails(delivery.id)}
                          a11y_buttonActionMessage={formatMessage(
                            isExpanded
                              ? messages.hideDetails
                              : messages.viewDetails
                          )}
                        />
                        <IconButton
                          iconName="refresh"
                          iconColor={colors.primary}
                          iconColorOnHover={colors.primary}
                          onClick={() => handleReplay(delivery.id)}
                          a11y_buttonActionMessage={formatMessage(
                            messages.replay
                          )}
                        />
                      </Box>
                    </Td>
                  </Tr>
                  {isExpanded && (
                    <Tr>
                      <Td colSpan={6} p="0px">
                        <Box p="20px" bgColor={colors.grey50}>
                          {delivery.attributes.last_attempt_at && (
                            <Box mb="12px">
                              <Text fontWeight="bold">
                                {formatMessage(messages.lastAttempt)}:
                              </Text>
                              <Text>
                                {formatDate(
                                  delivery.attributes.last_attempt_at
                                )}
                              </Text>
                            </Box>
                          )}
                          {delivery.attributes.succeeded_at && (
                            <Box mb="12px">
                              <Text fontWeight="bold">
                                {formatMessage(messages.succeededAt)}:
                              </Text>
                              <Text>
                                {formatDate(delivery.attributes.succeeded_at)}
                              </Text>
                            </Box>
                          )}
                          {delivery.attributes.error_message && (
                            <Box mb="12px">
                              <Text fontWeight="bold">
                                {formatMessage(messages.errorMessage)}:
                              </Text>
                              <CodeBlock>
                                {delivery.attributes.error_message}
                              </CodeBlock>
                            </Box>
                          )}
                          {delivery.attributes.response_body && (
                            <Box mb="12px">
                              <Text fontWeight="bold">
                                {formatMessage(messages.responseBody)}:
                              </Text>
                              <CodeBlock>
                                {delivery.attributes.response_body}
                              </CodeBlock>
                            </Box>
                          )}
                        </Box>
                      </Td>
                    </Tr>
                  )}
                </React.Fragment>
              );
            })}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};

export default DeliveriesModal;
