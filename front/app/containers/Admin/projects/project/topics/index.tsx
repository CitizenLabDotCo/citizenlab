import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import useInputTopics from 'api/input_topics/useInputTopics';
import useDeleteInputTopic from 'api/input_topics/useDeleteInputTopic';
import useReorderInputTopic from 'api/input_topics/useReorderInputTopic';
import { IInputTopicData } from 'api/input_topics/types';

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
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { isNilOrError } from 'utils/helperUtils';
import { isAdmin } from 'utils/permissions/roles';

import messages from './messages';
import InputTopicModal from './InputTopicModal';

const ProjectInputTopics = ({ params: { projectId } }: WithRouterProps) => {
  const { data: authUser } = useAuthUser();
  const { data: inputTopics } = useInputTopics(projectId);
  const { mutate: deleteInputTopic, isLoading: isDeleting } =
    useDeleteInputTopic();
  const { mutate: reorderInputTopic } = useReorderInputTopic();

  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [topicIdToDelete, setTopicIdToDelete] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [topicToEdit, setTopicToEdit] = useState<IInputTopicData | null>(null);

  if (!authUser || isNilOrError(inputTopics)) return null;

  const canAccessPlatformTopicsSettingsRoute = isAdmin(authUser);

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
      deleteInputTopic(
        { projectId, id: topicIdToDelete },
        {
          onSuccess: () => {
            setShowConfirmationModal(false);
            setTopicIdToDelete(null);
          },
        }
      );
    }
  };

  const handleReorder = (id: string, ordering: number) => {
    reorderInputTopic({ projectId, id, ordering });
  };

  const handleEditClick =
    (topic: IInputTopicData) => (event: React.FormEvent<any>) => {
      event.preventDefault();
      setTopicToEdit(topic);
      setShowEditModal(true);
    };

  const handleAddClick = () => {
    setTopicToEdit(null);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setTopicToEdit(null);
  };

  const isLastTopic = inputTopics.data.length === 1;

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

      {isLastTopic && (
        <Warning>
          <FormattedMessage {...messages.lastTopicWarning} />
        </Warning>
      )}

      <SortableList items={inputTopics.data} onReorder={handleReorder}>
        {({ itemsList, handleDragRow, handleDropRow }) => (
          <>
            {itemsList.map((topic: IInputTopicData, index: number) => (
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
                    onClick={handleEditClick(topic)}
                    buttonStyle="secondary-outlined"
                    icon="edit"
                    m="0px"
                    id="e2e-input-topic-edit-button"
                  >
                    <FormattedMessage {...messages.edit} />
                  </ButtonWithLink>
                  <ButtonWithLink
                    onClick={handleDeleteClick(topic.id)}
                    buttonStyle="text"
                    icon="delete"
                    disabled={isLastTopic}
                    id="e2e-input-topic-delete-button"
                  >
                    <FormattedMessage {...messages.delete} />
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
            <FormattedMessage {...messages.deleteInputTopicConfirmation} />
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
        opened={showEditModal}
        close={closeEditModal}
      />
    </Box>
  );
};

export default withRouter(ProjectInputTopics);
