import React, { memo, FormEvent, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';
import { withRouter, WithRouterProps } from 'react-router';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import Button from 'components/UI/Button';
import { SortableList, SortableRow } from 'components/admin/ResourceList';
import { RowContent, RowContentInner, RowTitle } from '../../components/StyledComponents';
import Warning from 'components/UI/Warning';
import Modal, { ModalContentContainer, Content, ButtonsWrapper } from 'components/UI/Modal';
import { StyledLink } from 'components/admin/Section';

// services
import { ITopicData } from 'services/topics';
import { deleteProjectTopic, reorderProjectTopic } from 'services/projectTopics';

// hooks
import useProjectTopics from 'hooks/useProjectTopics';
import useTopics from 'hooks/useTopics';

const StyledWarning = styled(Warning)`
  margin-bottom: 20px;
`;

interface Props {}

const SortableProjectTopicList = memo(({
  params: { projectId },
}: Props & WithRouterProps) => {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [processingDeletion, setProcessingDeletion] = useState(false);
  const [topicIdToDelete, setTopicIdToDelete] = useState<string | null>(null);
  const projectTopics = useProjectTopics({ projectId });
  const topicIds = !isNilOrError(projectTopics) ? projectTopics.map(topic => topic.relationships.topic.data.id) : [];
  const topics = useTopics({ topicIds });

  const handleProjectTopicDelete = (topicId: string) => (event: FormEvent) => {
    event.preventDefault();

    setShowConfirmationModal(true);
    setTopicIdToDelete(topicId);
  };

  const handleProjectTopicDeletionConfirm = () => {
    if (topicIdToDelete) {
      setProcessingDeletion(true);
      deleteProjectTopic(projectId, topicIdToDelete)
      .then(() => {
        setProcessingDeletion(false);
        setShowConfirmationModal(false);
        setTopicIdToDelete(null);
      });
    }
  };

  const handleReorderTopicProject = (topicId, newOrder) => {
    reorderProjectTopic(projectId, topicId, newOrder);
  };

  const closeSendConfirmationModal = () => {
    setShowConfirmationModal(false);
    setTopicIdToDelete(null);
  };

  if (
    !isNilOrError(topics) &&
    topics.length > 0
  ) {
    const filteredTopics = topics.filter(topic => !isNilOrError(topic)) as ITopicData[];
    const isLastSelectedTopic = filteredTopics.length === 1;

    return (
      <>
        {isLastSelectedTopic &&
          <StyledWarning>
            <FormattedMessage
              {...messages.fewerThanOneTopicWarning}
              values={{
                ideaFormLink:
                  <StyledLink to={`/admin/projects/${projectId}/ideaform`}>
                    <FormattedMessage {...messages.ideaForm} />
                  </StyledLink>
              }}
            />
          </StyledWarning>
        }
        <SortableList
          items={filteredTopics}
          onReorder={handleReorderTopicProject}
          className="projects-list e2e-admin-projects-list"
          id="e2e-admin-published-projects-list"
        >
          {({ itemsList, handleDragRow, handleDropRow }) => (
            itemsList.map((topic: ITopicData, index: number) => {
              return (
                <SortableRow
                  id={topic.id}
                  key={index}
                  index={index}
                  moveRow={handleDragRow}
                  dropRow={handleDropRow}
                  lastItem={(index === filteredTopics.length - 1)}
                >
                  <RowContent>
                    <RowContentInner className="expand primary">
                      <RowTitle value={topic.attributes.title_multiloc} />
                    </RowContentInner>
                  </RowContent>
                  <Button
                    onClick={handleProjectTopicDelete(topic.id)}
                    buttonStyle="text"
                    icon="delete"
                    disabled={isLastSelectedTopic}
                    id="e2e-project-topic-delete-button"
                  >
                    <FormattedMessage {...messages.delete} />
                  </Button>
                </SortableRow>
              );
            }))
          }
        </SortableList>
        <Modal
          opened={showConfirmationModal}
          close={closeSendConfirmationModal}
          header={<FormattedMessage {...messages.confirmHeader} />}
        >
          <ModalContentContainer>
            <Content>
              <FormattedMessage {...messages.topicDeletionWarning} />
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
                onClick={handleProjectTopicDeletionConfirm}
                processing={processingDeletion}
                id="e2e-project-topic-delete-confirm-button"
              >
                <FormattedMessage {...messages.delete} />
              </Button>
            </ButtonsWrapper>
          </ModalContentContainer>
        </Modal>
      </>
    );
  }

  return null;
});

export default withRouter(SortableProjectTopicList);
