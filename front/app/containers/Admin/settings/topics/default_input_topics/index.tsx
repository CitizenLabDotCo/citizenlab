import React, { useState, useMemo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IDefaultInputTopicData } from 'api/default_input_topics/types';
import useDefaultInputTopics from 'api/default_input_topics/useDefaultInputTopics';
import useDeleteDefaultInputTopic from 'api/default_input_topics/useDeleteDefaultInputTopic';
import useMoveDefaultInputTopic from 'api/default_input_topics/useMoveDefaultInputTopic';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { ButtonWrapper } from 'components/admin/PageWrapper';
import { TextCell } from 'components/admin/ResourceList';
import SortableList from 'components/admin/ResourceList/SortableList';
import SortableRow from 'components/admin/ResourceList/SortableRow';
import { Section, SectionDescription } from 'components/admin/Section';
import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal, {
  ModalContentContainer,
  ButtonsWrapper,
  Content,
} from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

const IndentedSortableRow = styled(SortableRow)<{ depth: number }>`
  padding-left: ${(props) => props.depth * 32}px;
`;

const DefaultInputTopics = () => {
  const nestedInputTopicsActive = useFeatureFlag({
    name: 'nested_input_topics',
  });
  const { data: defaultInputTopics } = useDefaultInputTopics();
  const { mutate: deleteDefaultInputTopic, isLoading: isDeleting } =
    useDeleteDefaultInputTopic();
  const { mutate: moveDefaultInputTopic } = useMoveDefaultInputTopic();
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [topicToDelete, setTopicToDelete] =
    useState<IDefaultInputTopicData | null>(null);

  const sortableItems = useMemo(() => {
    if (isNilOrError(defaultInputTopics)) return [];
    return defaultInputTopics.data.map((topic, index) => ({
      ...topic,
      attributes: {
        ...topic.attributes,
        ordering: index,
      },
    }));
  }, [defaultInputTopics]);

  const handleReorder = (topicId: string, newIndex: number) => {
    const currentIndex = sortableItems.findIndex((t) => t.id === topicId);
    if (currentIndex === -1 || currentIndex === newIndex) return;

    const upOrDown = newIndex < currentIndex ? 'up' : 'down';
    const newAbove = upOrDown === 'up' ? newIndex - 1 : newIndex;
    const newUnder = upOrDown === 'up' ? newIndex : newIndex + 1;

    const newAboveTopic = sortableItems[newAbove] as
      | IDefaultInputTopicData
      | undefined;
    const movedTopic = sortableItems[currentIndex];
    const newUnderTopic = sortableItems[newUnder] as
      | IDefaultInputTopicData
      | undefined;

    const aboveDepth = newAboveTopic ? newAboveTopic.attributes.depth : -1;
    const currentDepth = movedTopic.attributes.depth;
    const underDepth = newUnderTopic ? newUnderTopic.attributes.depth : -1;

    let position;
    let targetId;

    if (aboveDepth === currentDepth) {
      position = 'right';
      targetId = newAboveTopic?.id;
    } else if (underDepth === currentDepth) {
      position = 'left';
      targetId = newUnderTopic?.id;
    } else if (aboveDepth < currentDepth) {
      position = 'child';
      targetId = newAboveTopic?.id;
    } else if (aboveDepth > currentDepth) {
      position = 'right';
      targetId = newAboveTopic?.relationships?.parent?.data?.id;
    }

    if (position && targetId) {
      moveDefaultInputTopic({
        id: topicId,
        position,
        target_id: targetId,
      });
    }
  };

  if (isNilOrError(defaultInputTopics)) return null;

  const handleDeleteClick =
    (topic: IDefaultInputTopicData) => (event: React.FormEvent<any>) => {
      event.preventDefault();
      setShowConfirmationModal(true);
      setTopicToDelete(topic);
    };

  const closeSendConfirmationModal = () => {
    setShowConfirmationModal(false);
    setTopicToDelete(null);
  };

  const handleTopicDeletionConfirm = () => {
    if (topicToDelete) {
      deleteDefaultInputTopic(topicToDelete.id, {
        onSuccess: () => {
          setShowConfirmationModal(false);
          setTopicToDelete(null);
        },
      });
    }
  };

  const hasChildren = topicToDelete?.attributes.children_count
    ? topicToDelete.attributes.children_count > 0
    : false;

  return (
    <Section>
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

      <SortableList items={sortableItems} onReorder={handleReorder}>
        {({ itemsList, handleDragRow, handleDropRow }) => (
          <>
            {itemsList.map((item, index) => {
              const topic = item as unknown as IDefaultInputTopicData;
              const isRootTopic = topic.attributes.depth === 0;

              return (
                <IndentedSortableRow
                  key={topic.id}
                  id={topic.id}
                  depth={topic.attributes.depth}
                  index={index}
                  isLastItem={index === itemsList.length - 1}
                  moveRow={handleDragRow}
                  dropRow={handleDropRow}
                >
                  <TextCell className="expand">
                    <T value={topic.attributes.title_multiloc} />
                  </TextCell>
                  <Box display="flex" alignItems="center" gap="16px">
                    {nestedInputTopicsActive && isRootTopic && (
                      <ButtonWithLink
                        linkTo={`/admin/settings/topics/input/new?parent_id=${topic.id}`}
                        buttonStyle="secondary-outlined"
                        icon="plus-circle"
                        m="0px"
                        id="e2e-add-subtopic-button"
                      >
                        <FormattedMessage {...messages.addSubtopicButton} />
                      </ButtonWithLink>
                    )}
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
                      onClick={handleDeleteClick(topic)}
                      buttonStyle="text"
                      icon="delete"
                      id="e2e-default-input-topic-delete-button"
                    >
                      <FormattedMessage {...messages.deleteButtonLabel} />
                    </ButtonWithLink>
                  </Box>
                </IndentedSortableRow>
              );
            })}
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
              {...(hasChildren
                ? messages.deleteDefaultInputTopicWithChildrenConfirmation
                : messages.deleteDefaultInputTopicConfirmation)}
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
              <FormattedMessage {...messages.deleteButtonLabel} />
            </ButtonWithLink>
          </ButtonsWrapper>
        </ModalContentContainer>
      </Modal>
    </Section>
  );
};

export default DefaultInputTopics;
