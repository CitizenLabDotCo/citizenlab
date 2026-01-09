import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useDefaultInputTopics from 'api/default_input_topics/useDefaultInputTopics';
import useDeleteDefaultInputTopic from 'api/default_input_topics/useDeleteDefaultInputTopic';
import useReorderDefaultInputTopic from 'api/default_input_topics/useReorderDefaultInputTopic';
import { IDefaultInputTopicData } from 'api/default_input_topics/types';

import { ButtonWrapper } from 'components/admin/PageWrapper';
import { TextCell } from 'components/admin/ResourceList';
import SortableList from 'components/admin/ResourceList/SortableList';
import SortableRow from 'components/admin/ResourceList/SortableRow';
import {
  Section,
  SectionDescription,
  SectionTitle,
} from 'components/admin/Section';
import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal, {
  ModalContentContainer,
  ButtonsWrapper,
  Content,
} from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';

const DefaultInputTopics = () => {
  const { data: defaultInputTopics } = useDefaultInputTopics();
  const { mutate: deleteDefaultInputTopic, isLoading: isDeleting } =
    useDeleteDefaultInputTopic();
  const { mutate: reorderDefaultInputTopic } = useReorderDefaultInputTopic();
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [topicIdToDelete, setTopicIdToDelete] = useState<string | null>(null);

  if (isNilOrError(defaultInputTopics)) return null;

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
      deleteDefaultInputTopic(topicIdToDelete, {
        onSuccess: () => {
          setShowConfirmationModal(false);
          setTopicIdToDelete(null);
        },
      });
    }
  };

  const handleReorder = (id: string, ordering: number) => {
    reorderDefaultInputTopic({ id, ordering });
  };

  return (
    <Section>
      <SectionTitle>
        <FormattedMessage {...messages.titleDefaultInputTopicManager} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage
          {...messages.descriptionDefaultInputTopicManagerText}
        />
      </SectionDescription>

      <ButtonWrapper>
        <ButtonWithLink
          buttonStyle="admin-dark"
          icon="plus-circle"
          linkTo="/admin/settings/topics/input/new"
          id="e2e-add-default-input-topic-button"
        >
          <FormattedMessage {...messages.addDefaultInputTopicButton} />
        </ButtonWithLink>
      </ButtonWrapper>

      <SortableList items={defaultInputTopics.data} onReorder={handleReorder}>
        {({ itemsList, handleDragRow, handleDropRow }) => (
          <>
            {itemsList.map((topic: IDefaultInputTopicData, index: number) => (
              <SortableRow
                key={topic.id}
                id={topic.id}
                index={index}
                isLastItem={index === itemsList.length - 1}
                moveRow={handleDragRow}
                dropRow={handleDropRow}
              >
                <TextCell className="expand">
                  <T value={topic.attributes.title_multiloc} />
                </TextCell>
                <Box display="flex" alignItems="center" gap="16px">
                  <ButtonWithLink
                    linkTo={`/admin/settings/topics/input/${topic.id}/edit`}
                    buttonStyle="secondary-outlined"
                    icon="edit"
                    m="0px"
                    id="e2e-default-input-topic-edit-button"
                  >
                    <FormattedMessage {...messages.editButtonLabel} />
                  </ButtonWithLink>
                  <ButtonWithLink
                    onClick={handleDeleteClick(topic.id)}
                    buttonStyle="text"
                    icon="delete"
                    id="e2e-default-input-topic-delete-button"
                  >
                    <FormattedMessage {...messages.deleteButtonLabel} />
                  </ButtonWithLink>
                </Box>
              </SortableRow>
            ))}
          </>
        )}
      </SortableList>

      <Modal
        opened={showConfirmationModal}
        close={closeSendConfirmationModal}
        header={<FormattedMessage {...messages.confirmHeader} />}
      >
        <ModalContentContainer>
          <Content>
            <FormattedMessage
              {...messages.deleteDefaultInputTopicConfirmation}
            />
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
              processing={isDeleting}
              id="e2e-default-input-topic-delete-confirmation-button"
            >
              <FormattedMessage {...messages.delete} />
            </ButtonWithLink>
          </ButtonsWrapper>
        </ModalContentContainer>
      </Modal>
    </Section>
  );
};

export default DefaultInputTopics;
