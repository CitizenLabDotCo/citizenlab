import React, { useState } from 'react';

import useDeleteGlobalTopic from 'api/global_topics/useDeleteGlobalTopic';
import useGlobalTopics from 'api/global_topics/useGlobalTopics';

import { ButtonWrapper } from 'components/admin/PageWrapper';
import {
  Section,
  SectionDescription,
  StyledLink,
} from 'components/admin/Section';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal, {
  ModalContentContainer,
  ButtonsWrapper,
  Content,
} from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';
import TopicsList from './TopicsList';
import TopicTermConfig from './TopicTermConfig';

const AllTopics = () => {
  const { data: topics } = useGlobalTopics({ includeStaticPages: true });
  const { mutate: deleteTopic, isLoading } = useDeleteGlobalTopic();
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [topicIdToDelete, setTopicIdToDelete] = useState<string | null>(null);

  if (isNilOrError(topics)) return null;

  const handleDeleteClick =
    (topicId: string) => (event: React.FormEvent<any>) => {
      event.preventDefault();

      setShowConfirmationModal(true);
      setTopicIdToDelete(topicId);
    };

  const closeSendConfirmationModal = () => {
    setShowConfirmationModal(false);
    setTopicIdToDelete(null);
  };

  const handleTopicDeletionConfirm = () => {
    if (topicIdToDelete) {
      deleteTopic(topicIdToDelete, {
        onSuccess: () => {
          setShowConfirmationModal(false);
          setTopicIdToDelete(null);
        },
      });
    }
  };

  return (
    <Section>
      <SectionDescription>
        <FormattedMessage
          {...messages.descriptionTopicManagerText}
          values={{
            adminProjectsLink: (
              <StyledLink to="/admin/projects/">
                <FormattedMessage {...messages.projectsSettings} />
              </StyledLink>
            ),
          }}
        />
      </SectionDescription>

      <TopicTermConfig />

      <ButtonWrapper>
        <ButtonWithLink
          buttonStyle="admin-dark"
          icon="plus-circle"
          linkTo="/admin/settings/topics/platform/new"
          id="e2e-add-custom-topic-button"
        >
          <FormattedMessage {...messages.addTopicButton} />
        </ButtonWithLink>
      </ButtonWrapper>

      <TopicsList topics={topics.data} handleDeleteClick={handleDeleteClick} />

      <Modal
        opened={showConfirmationModal}
        close={closeSendConfirmationModal}
        header={<FormattedMessage {...messages.confirmHeader} />}
      >
        <ModalContentContainer>
          <Content>
            <FormattedMessage {...messages.deleteTopicConfirmation} />
          </Content>
          <ButtonsWrapper>
            <ButtonWithLink
              buttonStyle="secondary-outlined"
              onClick={closeSendConfirmationModal}
            >
              <FormattedMessage {...messages.cancel} />
            </ButtonWithLink>
            <ButtonWithLink
              buttonStyle="delete"
              onClick={handleTopicDeletionConfirm}
              processing={isLoading}
              id="e2e-custom-topic-delete-confirmation-button"
            >
              <FormattedMessage {...messages.deleteButtonLabel} />
            </ButtonWithLink>
          </ButtonsWrapper>
        </ModalContentContainer>
      </Modal>
    </Section>
  );
};

export default AllTopics;
