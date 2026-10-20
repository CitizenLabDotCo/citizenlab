import { useMemo, useState } from 'react';

import { IInputTopicData } from 'api/input_topics/types';
import useDeleteInputTopic from 'api/input_topics/useDeleteInputTopic';
import useInputTopics from 'api/input_topics/useInputTopics';

import messages from './messages';

const useInputTopicsEditor = (projectId: string) => {
  const { data: inputTopics } = useInputTopics(projectId);
  const { mutate: deleteInputTopic, isPending: isDeleting } =
    useDeleteInputTopic();

  const [topicToDelete, setTopicToDelete] = useState<IInputTopicData | null>(
    null
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [topicToEdit, setTopicToEdit] = useState<IInputTopicData | null>(null);
  const [parentIdForNewTopic, setParentIdForNewTopic] = useState<
    string | undefined
  >(undefined);

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

  const confirmDelete = () => {
    if (topicToDelete) {
      deleteInputTopic(
        { projectId, id: topicToDelete.id },
        { onSuccess: closeDeleteModal }
      );
    }
  };

  const deleteMessage =
    (topicToDelete?.attributes.children_count ?? 0) > 0
      ? messages.deleteInputTopicWithChildrenConfirmation
      : messages.deleteInputTopicConfirmation;

  // Memoized so callers can tell a refetch apart from a re-render.
  const rootTopics = useMemo(
    () =>
      (inputTopics?.data ?? []).filter(
        (topic) => !topic.relationships.parent?.data
      ),
    [inputTopics]
  );

  return {
    inputTopics,
    rootTopics,
    isLastRootTopic: rootTopics.length === 1,
    openAdd,
    openAddSubtopic,
    openEdit,
    closeEditModal,
    showEditModal,
    topicToEdit,
    parentIdForNewTopic,
    openDelete: setTopicToDelete,
    closeDeleteModal,
    confirmDelete,
    topicToDelete,
    deleteMessage,
    isDeleting,
  };
};

export default useInputTopicsEditor;
