import React, { useState } from 'react';

// hooks
import useTopics from 'api/topics/useTopics';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import {
  Section,
  SectionDescription,
  SectionTitle,
  StyledLink,
} from 'components/admin/Section';
import Button from 'components/UI/Button';
import { ButtonWrapper } from 'components/admin/PageWrapper';
import TopicTermConfig from './TopicTermConfig';
import TopicsList from './TopicsList';
import Modal, {
  ModalContentContainer,
  ButtonsWrapper,
  Content,
} from 'components/UI/Modal';

// utils
import { isNilOrError } from 'utils/helperUtils';
import useDeleteTopic from 'api/topics/useDeleteTopic';

const AllTopics = () => {
  const { data: topics } = useTopics({ includeStaticPages: true });
  const { mutate: deleteTopic, isLoading } = useDeleteTopic();
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
      <SectionTitle>
        <FormattedMessage {...messages.titleTopicManager} />
      </SectionTitle>
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
        <Button
          buttonStyle="cl-blue"
          icon="plus-circle"
          linkTo="/admin/settings/topics/new"
          id="e2e-add-custom-topic-button"
        >
          <FormattedMessage {...messages.addTopicButton} />
        </Button>
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
            <Button
              buttonStyle="secondary"
              onClick={closeSendConfirmationModal}
            >
              <FormattedMessage {...messages.cancel} />
            </Button>
            <Button
              buttonStyle="delete"
              onClick={handleTopicDeletionConfirm}
              processing={isLoading}
              id="e2e-custom-topic-delete-confirmation-button"
            >
              <FormattedMessage {...messages.delete} />
            </Button>
          </ButtonsWrapper>
        </ModalContentContainer>
      </Modal>
    </Section>
  );
};

export default AllTopics;
