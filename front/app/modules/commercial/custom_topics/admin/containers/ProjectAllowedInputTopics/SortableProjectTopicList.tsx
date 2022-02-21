import React, { memo, FormEvent, useState, useMemo } from 'react';
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
} from '../../components/RowStyles';
import Warning from 'components/UI/Warning';
import Modal, {
  ModalContentContainer,
  Content,
  ButtonsWrapper,
} from 'components/UI/Modal';
import { StyledLink } from 'components/admin/Section';

// services
import {
  deleteProjectAllowedInputTopic,
  reorderProjectAllowedInputTopic,
  getTopicIds,
} from 'services/projectAllowedInputTopics';

// hooks
import useProjectAllowedInputTopics from 'hooks/useProjectAllowedInputTopics';
import useTopics from 'hooks/useTopics';

const StyledWarning = styled(Warning)`
  margin-bottom: 20px;
`;

interface Props {}

const SortableProjectTopicList = memo(
  ({ params: { projectId } }: Props & WithRouterProps) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [processingDeletion, setProcessingDeletion] = useState(false);
    const [
      projectAllowedInputTopicIdToDelete,
      setProjectAllowedInputTopicIdToDelete,
    ] = useState<string | null>(null);
    const allowedInputTopics = useProjectAllowedInputTopics(projectId);

    const topicIds = useMemo(
      () => getTopicIds(allowedInputTopics),
      [allowedInputTopics]
    );

    const topics = useTopics({ topicIds });

    const handleProjectTopicDelete =
      (projectAllowedInputTopicId: string) => (event: FormEvent) => {
        event.preventDefault();

        setShowConfirmationModal(true);
        setProjectAllowedInputTopicIdToDelete(projectAllowedInputTopicId);
      };

    const handleProjectTopicDeletionConfirm = () => {
      if (projectAllowedInputTopicIdToDelete) {
        setProcessingDeletion(true);
        deleteProjectAllowedInputTopic(
          projectId,
          projectAllowedInputTopicIdToDelete
        ).then(() => {
          setProcessingDeletion(false);
          setShowConfirmationModal(false);
          setProjectAllowedInputTopicIdToDelete(null);
        });
      }
    };

    const handleReorderTopicProject = (
      projectAllowedInputTopicId: string,
      newOrder: number
    ) => {
      reorderProjectAllowedInputTopic(
        projectAllowedInputTopicId,
        newOrder,
        projectId
      );
    };

    const closeSendConfirmationModal = () => {
      setShowConfirmationModal(false);
      setProjectAllowedInputTopicIdToDelete(null);
    };

    if (
      !isNilOrError(allowedInputTopics) &&
      !isNilOrError(topics) &&
      allowedInputTopics.length > 0 &&
      topics.length > 0 &&
      allowedInputTopics.length === topics.length
    ) {
      const isLastSelectedTopic = allowedInputTopics.length === 1;

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
            items={allowedInputTopics}
            onReorder={handleReorderTopicProject}
            className="projects-list e2e-admin-projects-list"
            id="e2e-admin-published-projects-list"
            key={allowedInputTopics.length}
          >
            {({ itemsList, handleDragRow, handleDropRow }) => (
              <>
                {itemsList.map((projectAllowedInputTopic, index: number) => (
                  <SortableRow
                    id={projectAllowedInputTopic.id}
                    key={index}
                    index={index}
                    moveRow={handleDragRow}
                    dropRow={handleDropRow}
                    isLastItem={index === allowedInputTopics.length - 1}
                  >
                    <RowContent>
                      <RowContentInner className="expand primary">
                        <RowTitle
                          value={topics[index].attributes.title_multiloc}
                        />
                      </RowContentInner>
                    </RowContent>
                    <Button
                      onClick={handleProjectTopicDelete(
                        projectAllowedInputTopic.id
                      )}
                      buttonStyle="text"
                      icon="delete"
                      disabled={isLastSelectedTopic}
                      id="e2e-project-topic-delete-button"
                    >
                      <FormattedMessage {...messages.delete} />
                    </Button>
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
