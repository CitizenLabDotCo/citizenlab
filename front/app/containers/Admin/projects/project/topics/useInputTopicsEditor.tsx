import React, { useMemo, useState } from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import { IInputTopicData } from 'api/input_topics/types';
import useDeleteInputTopic from 'api/input_topics/useDeleteInputTopic';
import useInputTopics from 'api/input_topics/useInputTopics';
import useMoveInputTopic from 'api/input_topics/useMoveInputTopic';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal, {
  ModalContentContainer,
  ButtonsWrapper,
  Content,
} from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';

import InputTopicModal from './InputTopicModal';
import messages from './messages';

// The list logic of a project's input tags: ordering, and the add, edit and
// delete flows. Callers lay out the list; `modals` must be rendered once.
const useInputTopicsEditor = (
  projectId: string,
  variant: 'default' | 'bo' = 'default'
) => {
  const { data: inputTopics } = useInputTopics(projectId);
  const { mutate: deleteInputTopic, isPending: isDeleting } =
    useDeleteInputTopic();
  const { mutate: moveInputTopic } = useMoveInputTopic();

  const [topicToDelete, setTopicToDelete] = useState<IInputTopicData | null>(
    null
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [topicToEdit, setTopicToEdit] = useState<IInputTopicData | null>(null);
  const [parentIdForNewTopic, setParentIdForNewTopic] = useState<
    string | undefined
  >(undefined);

  // Convert flattened list to sortable items with ordering attribute
  const sortableItems = useMemo(
    () =>
      (inputTopics?.data ?? []).map((topic, index) => ({
        ...topic,
        attributes: {
          ...topic.attributes,
          ordering: index,
        },
      })),
    [inputTopics]
  );

  const handleReorder = (topicId: string, newIndex: number) => {
    const currentIndex = sortableItems.findIndex((t) => t.id === topicId);
    if (currentIndex === -1 || currentIndex === newIndex) return;

    const upOrDown = newIndex < currentIndex ? 'up' : 'down';
    const newAbove = upOrDown === 'up' ? newIndex - 1 : newIndex;
    const newUnder = upOrDown === 'up' ? newIndex : newIndex + 1;

    // `.at(-1)` would wrap to the last item, so moving to the top has no topic above.
    const newAboveTopic =
      newAbove >= 0 ? sortableItems.at(newAbove) : undefined;
    const movedTopic = sortableItems[currentIndex];
    const newUnderTopic = sortableItems.at(newUnder);

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
      targetId = newAboveTopic?.relationships.parent?.data?.id;
    }

    if (position && targetId) {
      moveInputTopic({
        projectId,
        id: topicId,
        position,
        target_id: targetId,
      });
    }
  };

  const openAdd = () => {
    setTopicToEdit(null);
    setParentIdForNewTopic(undefined);
    setShowEditModal(true);
  };

  const openAddSubtopic = (parentId: string) => {
    setTopicToEdit(null);
    setParentIdForNewTopic(parentId);
    setShowEditModal(true);
  };

  const openEdit = (topic: IInputTopicData) => {
    setTopicToEdit(topic);
    setParentIdForNewTopic(undefined);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setTopicToEdit(null);
    setParentIdForNewTopic(undefined);
  };

  const closeDeleteModal = () => setTopicToDelete(null);

  const handleTopicDeletionConfirm = () => {
    if (topicToDelete) {
      deleteInputTopic(
        { projectId, id: topicToDelete.id },
        { onSuccess: closeDeleteModal }
      );
    }
  };

  const hasChildren = (topicToDelete?.attributes.children_count ?? 0) > 0;

  const deleteMessage = hasChildren
    ? messages.deleteInputTopicWithChildrenConfirmation
    : messages.deleteInputTopicConfirmation;

  const deleteModal =
    variant === 'bo' ? (
      <Modal
        variant="bo"
        opened={!!topicToDelete}
        close={closeDeleteModal}
        width={540}
        header={<FormattedMessage {...messages.confirmHeader} />}
        footer={
          <Box display="flex" justifyContent="flex-end" gap="8px" w="100%">
            <Button
              buttonStyle="bo-secondary"
              width="auto"
              onClick={closeDeleteModal}
            >
              <FormattedMessage {...messages.cancel} />
            </Button>
            <Button
              buttonStyle="bo-delete"
              width="auto"
              onClick={handleTopicDeletionConfirm}
              processing={isDeleting}
              id="e2e-input-topic-delete-confirmation-button"
            >
              <FormattedMessage {...messages.delete} />
            </Button>
          </Box>
        }
      >
        <Box p="24px">
          <Text variant="boControl" m="0px">
            <FormattedMessage {...deleteMessage} />
          </Text>
        </Box>
      </Modal>
    ) : (
      <Modal
        opened={!!topicToDelete}
        close={closeDeleteModal}
        header={<FormattedMessage {...messages.confirmHeader} />}
      >
        <ModalContentContainer>
          <Content>
            <FormattedMessage {...deleteMessage} />
          </Content>
          <ButtonsWrapper>
            <ButtonWithLink
              buttonStyle="secondary-outlined"
              onClick={closeDeleteModal}
            >
              <FormattedMessage {...messages.cancel} />
            </ButtonWithLink>
            <ButtonWithLink
              buttonStyle="delete"
              onClick={handleTopicDeletionConfirm}
              processing={isDeleting}
              id="e2e-input-topic-delete-confirmation-button"
            >
              <FormattedMessage {...messages.delete} />
            </ButtonWithLink>
          </ButtonsWrapper>
        </ModalContentContainer>
      </Modal>
    );

  const modals = (
    <>
      {deleteModal}
      <InputTopicModal
        projectId={projectId}
        topic={topicToEdit}
        parentId={parentIdForNewTopic}
        opened={showEditModal}
        close={closeEditModal}
        variant={variant}
      />
    </>
  );

  return {
    inputTopics,
    sortableItems,
    isLastRootTopic: inputTopics?.data.length === 1,
    handleReorder,
    openAdd,
    openAddSubtopic,
    openEdit,
    openDelete: setTopicToDelete,
    modals,
  };
};

export default useInputTopicsEditor;
