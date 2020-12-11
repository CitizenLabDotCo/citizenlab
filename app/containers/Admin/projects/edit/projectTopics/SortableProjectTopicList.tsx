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
import {
  RowContent,
  RowContentInner,
  RowTitle,
} from '../../components/StyledComponents';
import Warning from 'components/UI/Warning';
import Modal, {
  ModalContentContainer,
  Content,
  ButtonsWrapper,
} from 'components/UI/Modal';
import { StyledLink } from 'components/admin/Section';

// services
import {
  deleteProjectTopic,
  reorderProjectTopic,
  IProjectTopicData,
} from 'services/projectTopics';

// hooks
import useProjectTopics from 'hooks/useProjectTopics';

// resources
import GetTopic from 'resources/GetTopic';

const StyledWarning = styled(Warning)`
  margin-bottom: 20px;
`;

interface Props {}

const SortableProjectTopicList = memo(
  ({ params: { projectId } }: Props & WithRouterProps) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [processingDeletion, setProcessingDeletion] = useState(false);
    const [projectTopicIdToDelete, setProjectTopicIdToDelete] = useState<
      string | null
    >(null);
    const projectTopics = useProjectTopics({ projectId });

    const handleProjectTopicDelete = (projectTopicId: string) => (
      event: FormEvent
    ) => {
      event.preventDefault();

      setShowConfirmationModal(true);
      setProjectTopicIdToDelete(projectTopicId);
    };

    const handleProjectTopicDeletionConfirm = () => {
      if (projectTopicIdToDelete) {
        setProcessingDeletion(true);
        deleteProjectTopic(projectId, projectTopicIdToDelete).then(() => {
          setProcessingDeletion(false);
          setShowConfirmationModal(false);
          setProjectTopicIdToDelete(null);
        });
      }
    };

    const handleReorderTopicProject = (projectTopicId, newOrder) => {
      reorderProjectTopic(projectTopicId, newOrder, projectId);
    };

    const closeSendConfirmationModal = () => {
      setShowConfirmationModal(false);
      setProjectTopicIdToDelete(null);
    };

    if (!isNilOrError(projectTopics) && projectTopics.length > 0) {
      const isLastSelectedTopic = projectTopics.length === 1;

      return (
        <>
          {isLastSelectedTopic && (
            <StyledWarning>
              <FormattedMessage
                {...messages.lastTopicWarning}
                values={{
                  ideaFormLink: (
                    <StyledLink to={`/admin/projects/${projectId}/ideaform`}>
                      <FormattedMessage {...messages.inputForm} />
                    </StyledLink>
                  ),
                }}
              />
            </StyledWarning>
          )}
          <SortableList
            items={projectTopics}
            onReorder={handleReorderTopicProject}
            className="projects-list e2e-admin-projects-list"
            id="e2e-admin-published-projects-list"
            key={projectTopics.length}
          >
            {({ itemsList, handleDragRow, handleDropRow }) => (
              <>
                {itemsList.map(
                  (projectTopic: IProjectTopicData, index: number) => (
                    <SortableRow
                      id={projectTopic.id}
                      key={index}
                      index={index}
                      moveRow={handleDragRow}
                      dropRow={handleDropRow}
                      lastItem={index === projectTopics.length - 1}
                    >
                      <RowContent>
                        <RowContentInner className="expand primary">
                          <GetTopic
                            id={projectTopic.relationships.topic.data.id}
                          >
                            {(topic) =>
                              !isNilOrError(topic) ? (
                                <RowTitle
                                  value={topic.attributes.title_multiloc}
                                />
                              ) : null
                            }
                          </GetTopic>
                        </RowContentInner>
                      </RowContent>
                      <Button
                        onClick={handleProjectTopicDelete(projectTopic.id)}
                        buttonStyle="text"
                        icon="delete"
                        disabled={isLastSelectedTopic}
                        id="e2e-project-topic-delete-button"
                      >
                        <FormattedMessage {...messages.delete} />
                      </Button>
                    </SortableRow>
                  )
                )}
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
                <FormattedMessage {...messages.generalTopicDeletionWarning} />
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
  }
);

export default withRouter(SortableProjectTopicList);
