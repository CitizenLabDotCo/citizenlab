import React, { memo, FormEvent, useState, useMemo } from 'react';
import styled from 'styled-components';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// utils
import { isNilOrError, byId } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import Button from 'components/UI/Button';
import { SortableList, SortableRow } from 'components/admin/ResourceList';
import Warning from 'components/UI/Warning';
import Modal, {
  ModalContentContainer,
  Content,
  ButtonsWrapper,
} from 'components/UI/Modal';
import { StyledLink } from 'components/admin/Section';
import VerticalCenterer from 'components/VerticalCenterer';
import { Spinner, Box } from '@citizenlab/cl2-component-library';
import T from 'components/T';

// services
import {
  deleteProjectAllowedInputTopic,
  reorderProjectAllowedInputTopic,
  getTopicIds,
  IProjectAllowedInputTopic,
} from 'services/projectAllowedInputTopics';

// hooks
import useProjectAllowedInputTopics from 'hooks/useProjectAllowedInputTopics';
import useTopics from 'api/topics/useTopics';

// styles
import { fontSizes } from 'utils/styleUtils';

export const RowTitle = styled(T)`
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 24px;
  margin-right: 10px;
`;

const StyledWarning = styled(Warning)`
  margin-bottom: 20px;
`;

const SortableProjectTopicList = memo(
  ({ params: { projectId } }: WithRouterProps) => {
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

    const { data: topics } = useTopics({});

    const topicsById = useMemo(() => {
      const filteredTopics =
        topics?.data.filter((topic) => topicIds.includes(topic.id)) || [];
      return !topics ? null : byId(filteredTopics);
    }, [topics, topicIds]);

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
                      <Box
                        className="expand primary"
                        display="flex"
                        flexWrap="wrap"
                        alignItems="center"
                        marginRight="20px"
                      >
                        <RowTitle value={getTitle(projectAllowedInputTopic)} />
                      </Box>
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
