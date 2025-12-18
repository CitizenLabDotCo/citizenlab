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
  Toggle,
  Badge,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useProjectById from 'api/projects/useProjectById';
import useDeleteWebhookSubscription from 'api/webhook_subscriptions/useDeleteWebhookSubscription';
import useRegenerateSecret from 'api/webhook_subscriptions/useRegenerateSecret';
import useUpdateWebhookSubscription from 'api/webhook_subscriptions/useUpdateWebhookSubscription';
import useWebhookSubscriptions from 'api/webhook_subscriptions/useWebhookSubscriptions';

import useLocalize from 'hooks/useLocalize';

import GoBackButton from 'components/UI/GoBackButton';
import Modal from 'components/UI/Modal';

import { useIntl, FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import SecretTokenDisplay from './components/SecretTokenDisplay';
import CreateSubscriptionModal from './CreateSubscriptionModal';
import DeliveriesModal from './DeliveriesModal';
import EditSubscriptionModal from './EditSubscriptionModal';
import messages from './messages';

const EllipsisText = styled.span`
  display: block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProjectName = ({ projectId }: { projectId: string | null }) => {
  const { data: project } = useProjectById(projectId || '');
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  if (!projectId) {
    return <Text fontSize="s">{formatMessage(messages.allProjects)}</Text>;
  }

  if (!project) {
    return <Spinner size="20px" />;
  }

  return (
    <Text fontSize="s">{localize(project.data.attributes.title_multiloc)}</Text>
  );
};

type ModalState =
  | { view: 'create' }
  | { view: 'edit'; subscriptionId: string }
  | { view: 'deliveries'; subscriptionId: string }
  | { view: 'new_secret'; new_secret_token: string }
  | { view: 'closed' };

const WebhookSubscriptions = () => {
  const [modal, setModal] = useState<ModalState>({ view: 'closed' });
  const { formatMessage } = useIntl();
  const { mutate: deleteSubscription } = useDeleteWebhookSubscription();
  const { mutate: updateSubscription } = useUpdateWebhookSubscription();
  const { mutateAsync: regenerateSecret } = useRegenerateSecret();
  const { data: subscriptions, isLoading } = useWebhookSubscriptions();

  const handleDeleteSubscription = (id: string) => {
    if (window.confirm(formatMessage(messages.deleteConfirmation))) {
      deleteSubscription(id);
    }
  };

  const handleToggleEnabled = (id: string, currentlyEnabled: boolean) => {
    updateSubscription({ id, enabled: !currentlyEnabled });
  };

  const handleRegenerateSecret = async (id: string) => {
    if (window.confirm(formatMessage(messages.regenerateSecretConfirmation))) {
      const response = await regenerateSecret(id);
      setModal({
        view: 'new_secret',
        new_secret_token: response.data.attributes.secret_token,
      });
    }
  };

  const openCreateModal = () => {
    setModal({ view: 'create' });
  };

  const closeModal = () => {
    setModal({ view: 'closed' });
  };

  const openEditModal = (id: string) => {
    setModal({ view: 'edit', subscriptionId: id });
  };

  const openDeliveriesModal = (id: string) => {
    setModal({ view: 'deliveries', subscriptionId: id });
  };

  return (
    <>
      <Box w="100%">
        <GoBackButton onClick={clHistory.goBack} />
      </Box>

      <Title variant="h1">{formatMessage(messages.title)}</Title>
      <Box display="flex" justifyContent={'space-between'} mb="12px" gap="10px">
        <Text>
          <FormattedMessage
            {...messages.description}
            values={{
              webhookDocumentationLink: (
                <a
                  href={formatMessage(messages.documentationUrl)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {formatMessage(messages.webhookDocumentationLink)}
                </a>
              ),
            }}
          />
        </Text>
        <Button color={colors.primary} onClick={openCreateModal}>
          {formatMessage(messages.createWebhookButton)}
        </Button>
      </Box>
      {isLoading && <Spinner />}
      {subscriptions && subscriptions.data.length > 0 && (
        <Table bgColor="white" data-testid="webhookSubscriptionsTable">
          <Thead>
            <Tr>
              <Th>{formatMessage(messages.enabled)}</Th>
              <Th>{formatMessage(messages.name)}</Th>
              <Th>{formatMessage(messages.url)}</Th>
              <Th>{formatMessage(messages.events)}</Th>
              <Th>{formatMessage(messages.project)}</Th>
              <Th>{formatMessage(messages.deliveryStats)}</Th>
              <Th>{formatMessage(messages.actions)}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {subscriptions.data.map((subscription) => {
              const stats = subscription.attributes.recent_delivery_stats;
              const projectId =
                subscription.relationships?.project?.data?.id || null;

              return (
                <Tr key={subscription.id}>
                  <Td>
                    <Toggle
                      checked={subscription.attributes.enabled}
                      onChange={() =>
                        handleToggleEnabled(
                          subscription.id,
                          subscription.attributes.enabled
                        )
                      }
                    />
                  </Td>
                  <Td>
                    <Text fontSize="s">{subscription.attributes.name}</Text>
                  </Td>
                  <Td>
                    <Tooltip content={subscription.attributes.url}>
                      <Text fontSize="s">
                        <EllipsisText>
                          {subscription.attributes.url}
                        </EllipsisText>
                      </Text>
                    </Tooltip>
                  </Td>
                  <Td>
                    <Text fontSize="s">
                      {subscription.attributes.events.join(', ')}
                    </Text>
                  </Td>
                  <Td>
                    <ProjectName projectId={projectId} />
                  </Td>
                  <Td>
                    <Box display="flex" gap="4px" flexWrap="wrap">
                      {stats.succeeded > 0 && (
                        <Badge color={colors.success}>
                          {stats.succeeded} {formatMessage(messages.succeeded)}
                        </Badge>
                      )}
                      {stats.failed > 0 && (
                        <Badge color={colors.error}>
                          {stats.failed} {formatMessage(messages.failed)}
                        </Badge>
                      )}
                      {stats.pending > 0 && (
                        <Badge color={colors.grey100}>
                          {stats.pending} {formatMessage(messages.pending)}
                        </Badge>
                      )}
                      {stats.total === 0 && <Text>-</Text>}
                    </Box>
                  </Td>
                  <Td>
                    <Box display="flex" gap="8px">
                      <IconButton
                        iconName="eye"
                        iconColor={colors.primary}
                        iconColorOnHover={colors.primary}
                        onClick={() => openDeliveriesModal(subscription.id)}
                        a11y_buttonActionMessage={formatMessage(
                          messages.viewDeliveries
                        )}
                      />
                      <IconButton
                        iconName="edit"
                        iconColor={colors.primary}
                        iconColorOnHover={colors.primary}
                        onClick={() => openEditModal(subscription.id)}
                        a11y_buttonActionMessage={formatMessage(messages.edit)}
                      />
                      <IconButton
                        iconName="refresh"
                        iconColor={colors.primary}
                        iconColorOnHover={colors.primary}
                        onClick={() => handleRegenerateSecret(subscription.id)}
                        a11y_buttonActionMessage={formatMessage(
                          messages.regenerateSecret
                        )}
                      />
                      <IconButton
                        iconName="delete"
                        iconColor={colors.red500}
                        iconColorOnHover={colors.red500}
                        onClick={() =>
                          handleDeleteSubscription(subscription.id)
                        }
                        a11y_buttonActionMessage={formatMessage(
                          messages.delete
                        )}
                      />
                    </Box>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      )}
      {subscriptions && subscriptions.data.length === 0 && (
        <Box display="flex" justifyContent="center" w="100%">
          <Title variant="h3">{formatMessage(messages.noWebhooks)}</Title>
        </Box>
      )}
      <Modal opened={modal.view === 'create'} close={closeModal}>
        <CreateSubscriptionModal onClose={closeModal} />
      </Modal>
      {modal.view === 'edit' && (
        <Modal opened={true} close={closeModal}>
          <EditSubscriptionModal
            subscriptionId={modal.subscriptionId}
            onClose={closeModal}
          />
        </Modal>
      )}
      {modal.view === 'deliveries' && (
        <Modal opened={true} close={closeModal} width="800px">
          <DeliveriesModal
            subscriptionId={modal.subscriptionId}
            onClose={closeModal}
          />
        </Modal>
      )}
      {modal.view === 'new_secret' && (
        <Modal opened={true} close={closeModal}>
          <Box data-testid="webhookNewSecret">
            <Title variant="h2">{formatMessage(messages.newSecretTitle)}</Title>
            <SecretTokenDisplay
              secret={modal.new_secret_token}
              onClose={closeModal}
            />
          </Box>
        </Modal>
      )}
    </>
  );
};

export default WebhookSubscriptions;
