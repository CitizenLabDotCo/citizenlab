import React, { useState, useMemo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IInputTopicData } from 'api/input_topics/types';
import useDeleteInputTopic from 'api/input_topics/useDeleteInputTopic';
import useInputTopics from 'api/input_topics/useInputTopics';
import useAuthUser from 'api/me/useAuthUser';

import { ButtonWrapper } from 'components/admin/PageWrapper';
import { TextCell, Row } from 'components/admin/ResourceList';
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
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { isNilOrError } from 'utils/helperUtils';
import { isAdmin } from 'utils/permissions/roles';

import InputTopicModal from './InputTopicModal';
import messages from './messages';

// Flatten the tree structure for display, preserving parent-child order
const flattenTopics = (
  topics: IInputTopicData[],
  included: IInputTopicData[] | undefined
): IInputTopicData[] => {
  const includedMap = new Map<string, IInputTopicData>();
  included?.forEach((topic) => includedMap.set(topic.id, topic));

  const result: IInputTopicData[] = [];

  topics.forEach((topic) => {
    result.push(topic);
    // Add children from included array
    const childIds = topic.relationships?.children?.data || [];
    childIds.forEach((childRef) => {
      const child = includedMap.get(childRef.id);
      if (child) {
        result.push(child);
      }
    });
  });

  return result;
};

const ProjectInputTopics = ({ params: { projectId } }: WithRouterProps) => {
  const { data: authUser } = useAuthUser();
  const { data: inputTopics } = useInputTopics(projectId);
  const { mutate: deleteInputTopic, isLoading: isDeleting } =
    useDeleteInputTopic();

  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [topicToDelete, setTopicToDelete] = useState<IInputTopicData | null>(
    null
  );
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [topicToEdit, setTopicToEdit] = useState<IInputTopicData | null>(null);
  const [parentIdForNewTopic, setParentIdForNewTopic] = useState<
    string | undefined
  >(undefined);

  const flattenedTopics = useMemo(() => {
    if (isNilOrError(inputTopics)) return [];
    return flattenTopics(inputTopics.data, inputTopics.included);
  }, [inputTopics]);

  if (!authUser || isNilOrError(inputTopics)) return null;

  const canAccessPlatformTopicsSettingsRoute = isAdmin(authUser);

  const handleDeleteClick =
    (topic: IInputTopicData) => (event: React.FormEvent<any>) => {
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
      deleteInputTopic(
        { projectId, id: topicToDelete.id },
        {
          onSuccess: () => {
            setShowConfirmationModal(false);
            setTopicToDelete(null);
          },
        }
      );
    }
  };

  const handleEditClick =
    (topic: IInputTopicData) => (event: React.FormEvent<any>) => {
      event.preventDefault();
      setTopicToEdit(topic);
      setParentIdForNewTopic(undefined);
      setShowEditModal(true);
    };

  const handleAddClick = () => {
    setTopicToEdit(null);
    setParentIdForNewTopic(undefined);
    setShowEditModal(true);
  };

  const handleAddSubtopicClick =
    (parentId: string) => (event: React.FormEvent<any>) => {
      event.preventDefault();
      setTopicToEdit(null);
      setParentIdForNewTopic(parentId);
      setShowEditModal(true);
    };

  const closeEditModal = () => {
    setShowEditModal(false);
    setTopicToEdit(null);
    setParentIdForNewTopic(undefined);
  };

  // Count only root topics for the last topic check
  const rootTopicsCount = inputTopics.data.length;
  const isLastRootTopic = rootTopicsCount === 1;

  const hasChildren = topicToDelete?.attributes.children_count
    ? topicToDelete.attributes.children_count > 0
    : false;

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

      <ButtonWrapper>
        <ButtonWithLink
          buttonStyle="admin-dark"
          icon="plus-circle"
          onClick={handleAddClick}
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

      <Box>
        {flattenedTopics.map((topic: IInputTopicData, index: number) => {
          const isSubtopic = topic.attributes.depth > 0;
          const isRootTopic = topic.attributes.depth === 0;
          // Only prevent deleting if it's the last root topic
          const canDelete = !(isRootTopic && isLastRootTopic);

          return (
            <Row
              key={topic.id}
              isLastItem={index === flattenedTopics.length - 1}
            >
              <TextCell className="expand">
                <Box ml={isSubtopic ? '32px' : '0px'}>
                  <T value={topic.attributes.title_multiloc} />
                </Box>
              </TextCell>
              <Box display="flex" alignItems="center" gap="16px">
                {isRootTopic && (
                  <ButtonWithLink
                    onClick={handleAddSubtopicClick(topic.id)}
                    buttonStyle="secondary-outlined"
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
            </Row>
          );
        })}
      </Box>

      <Modal
        opened={showConfirmationModal}
        close={closeSendConfirmationModal}
        header={<FormattedMessage {...messages.confirmHeader} />}
      >
        <ModalContentContainer>
          <Content>
            <FormattedMessage
              {...(hasChildren
                ? messages.deleteInputTopicWithChildrenConfirmation
                : messages.deleteInputTopicConfirmation)}
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

export default withRouter(ProjectInputTopics);
