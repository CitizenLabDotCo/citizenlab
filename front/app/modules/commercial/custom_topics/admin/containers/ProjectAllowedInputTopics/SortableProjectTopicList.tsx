import React, { FormEvent, memo, useMemo, useState } from 'react';
import styled from 'styled-components';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// utils
import { byId, isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import { Spinner } from '@citizenlab/cl2-component-library';
import { SortableList, SortableRow } from 'components/admin/ResourceList';
import { StyledLink } from 'components/admin/Section';
import Button from 'components/UI/Button';
import Modal, {
  ButtonsWrapper,
  Content,
  ModalContentContainer,
} from 'components/UI/Modal';
import Warning from 'components/UI/Warning';
import VerticalCenterer from 'components/VerticalCenterer';
import {
  RowContent,
  RowContentInner,
  RowTitle,
} from '../../components/RowStyles';

// services
import {
  deleteProjectAllowedInputTopic,
  getTopicIds,
  IProjectAllowedInputTopic,
  reorderProjectAllowedInputTopic,
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
    const topicsById = useMemo(() => {
      return isNilOrError(topics) ? null : byId(topics);
    }, [topics]);

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
      !isNilOrError(topicsById) &&
      allowedInputTopics.length > 0 &&
      allowedInputTopics.length === Object.keys(topicsById).length
    ) {
      const isLastSelectedTopic = allowedInputTopics.length === 1;

      const getTitle = ({ relationships }: IProjectAllowedInputTopic) => {
        return topicsById[relationships.topic.data.id].attributes
          .title_multiloc;
      };

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
                {itemsList.map(
                  (
                    projectAllowedInputTopic: IProjectAllowedInputTopic,
                    index: number
                  ) => (
                    <SortableRow
                      id={projectAllowedInputTopic.id}
                      key={projectAllowedInputTopic.id}
                      index={index}
                      moveRow={handleDragRow}
                      dropRow={handleDropRow}
                      isLastItem={index === allowedInputTopics.length - 1}
                    >
                      <RowContent>
                        <RowContentInner className="expand primary">
                          <RowTitle
                            value={getTitle(projectAllowedInputTopic)}
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

    return (
      <VerticalCenterer>
        <Spinner />
      </VerticalCenterer>
    );
  }
);

export default withRouter(SortableProjectTopicList);
