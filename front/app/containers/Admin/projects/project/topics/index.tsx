import React, { useMemo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IInputTopicData } from 'api/input_topics/types';
import useMoveInputTopic from 'api/input_topics/useMoveInputTopic';
import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { ButtonWrapper } from 'components/admin/PageWrapper';
import { TextCell } from 'components/admin/ResourceList';
import SortableList from 'components/admin/ResourceList/SortableList';
import SortableRow from 'components/admin/ResourceList/SortableRow';
import {
  SectionTitle,
  SectionDescription,
  StyledLink,
} from 'components/admin/Section';
import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal, {
  ModalContentContainer,
  ButtonsWrapper,
  Content,
} from 'components/UI/Modal';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { isAdmin } from 'utils/permissions/roles';
import { useParams } from 'utils/router';

import InputTopicModal from './InputTopicModal';
import LiveAutoInputTopicsControl from './LiveAutoInputTopicsControl';
import messages from './messages';
import useInputTopicsEditor from './useInputTopicsEditor';

const IndentedSortableRow = styled(SortableRow)<{ depth: number }>`
  padding-left: ${(props) => props.depth * 32}px;
`;

const ProjectInputTopics = () => {
  const { projectId } = useParams({
    from: '/$locale/admin/projects/$projectId',
  });

  const nestedInputTopicsActive = useFeatureFlag({
    name: 'nested_input_topics',
  });

  const { data: authUser } = useAuthUser();
  const {
    inputTopics,
    isLastRootTopic,
    openAdd,
    openAddSubtopic,
    openEdit,
    closeEditModal,
    showEditModal,
    topicToEdit,
    parentIdForNewTopic,
    openDelete,
    closeDeleteModal,
    confirmDelete,
    topicToDelete,
    deleteMessage,
    isDeleting,
  } = useInputTopicsEditor(projectId);
  const { mutate: moveInputTopic } = useMoveInputTopic();

  // Convert flattened list to sortable items with ordering attribute
  const sortableItems = useMemo(() => {
    if (isNilOrError(inputTopics)) return [];
    return inputTopics.data.map((topic, index) => ({
      ...topic,
      attributes: {
        ...topic.attributes,
        ordering: index,
      },
    }));
  }, [inputTopics]);

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

  if (!authUser || isNilOrError(inputTopics)) return null;

  const canAccessPlatformTopicsSettingsRoute = isAdmin(authUser);

  const handleDeleteClick =
    (topic: IInputTopicData) => (event: React.FormEvent<any>) => {
      event.preventDefault();
      openDelete(topic);
    };

  const handleEditClick =
    (topic: IInputTopicData) => (event: React.FormEvent<any>) => {
      event.preventDefault();
      openEdit(topic);
    };

  const handleAddSubtopicClick =
    (parentId: string) => (event: React.FormEvent<any>) => {
      event.preventDefault();
      openAddSubtopic(parentId);
    };

  return (
    <Box minHeight="80vh" mb="40px">
      <SectionTitle>
        <FormattedMessage {...messages.title} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.projectTopicsDescription} />
        {canAccessPlatformTopicsSettingsRoute && (
          <span>
            &nbsp;
            <FormattedMessage
              {...messages.defaultInputTopicsInfo}
              values={{
                settingsLink: (
                  <StyledLink to="/admin/settings/topics/input">
                    <FormattedMessage
                      {...messages.defaultInputTopicsSettings}
                    />
                  </StyledLink>
                ),
              }}
            />
          </span>
        )}
      </SectionDescription>

      <LiveAutoInputTopicsControl projectId={projectId} />

      <ButtonWrapper>
        <ButtonWithLink
          buttonStyle="admin-dark"
          icon="plus-circle"
          onClick={openAdd}
          id="e2e-add-input-topic-button"
        >
          <FormattedMessage {...messages.addInputTopic} />
        </ButtonWithLink>
      </ButtonWrapper>

      {isLastRootTopic && (
        <Warning>
          <FormattedMessage {...messages.lastTopicWarning} />
        </Warning>
      )}

      <SortableList items={sortableItems} onReorder={handleReorder}>
        {({ itemsList, handleDragRow, handleDropRow }) => (
          <>
            {itemsList.map((item, index) => {
              const topic = item as unknown as IInputTopicData;
              const isRootTopic = topic.attributes.depth === 0;
              // Only prevent deleting if it's the last root topic
              const canDelete = !(isRootTopic && isLastRootTopic);

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
                        onClick={handleAddSubtopicClick(topic.id)}
                        buttonStyle="text"
                        icon="plus-circle"
                        m="0px"
                        id="e2e-add-subtopic-button"
                      >
                        <FormattedMessage {...messages.addSubtopic} />
                      </ButtonWithLink>
                    )}
                    <ButtonWithLink
                      onClick={handleEditClick(topic)}
                      buttonStyle="secondary-outlined"
                      icon="edit"
                      m="0px"
                      id="e2e-input-topic-edit-button"
                    >
                      <FormattedMessage {...messages.edit} />
                    </ButtonWithLink>
                    <ButtonWithLink
                      onClick={handleDeleteClick(topic)}
                      buttonStyle="text"
                      icon="delete"
                      disabled={!canDelete}
                      id="e2e-input-topic-delete-button"
                    >
                      <FormattedMessage {...messages.delete} />
                    </ButtonWithLink>
                  </Box>
                </IndentedSortableRow>
              );
            })}
          </>
        )}
      </SortableList>

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
              onClick={confirmDelete}
              processing={isDeleting}
              id="e2e-input-topic-delete-confirmation-button"
            >
              <FormattedMessage {...messages.delete} />
            </ButtonWithLink>
          </ButtonsWrapper>
        </ModalContentContainer>
      </Modal>

      <InputTopicModal
        projectId={projectId}
        topic={topicToEdit}
        parentId={parentIdForNewTopic}
        opened={showEditModal}
        close={closeEditModal}
      />
    </Box>
  );
};

export default ProjectInputTopics;
