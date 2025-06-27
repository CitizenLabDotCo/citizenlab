import React, { memo, FormEvent, useState, useMemo } from 'react';

import { Spinner, Box, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IProjectAllowedInputTopicData } from 'api/project_allowed_input_topics/types';
import useDeleteAllowedProjectInputTopic from 'api/project_allowed_input_topics/useDeleteProjectAllowedInputTopic';
import useProjectAllowedInputTopics from 'api/project_allowed_input_topics/useProjectAllowedInputTopics';
import useReorderProjectAllowedInputTopics from 'api/project_allowed_input_topics/useReorderProjectAllowedInputTopics';
import { getTopicIds } from 'api/project_allowed_input_topics/util/getProjectTopicsIds';
import useTopics from 'api/topics/useTopics';

import SortableList from 'components/admin/ResourceList/SortableList';
import SortableRow from 'components/admin/ResourceList/SortableRow';
import { StyledLink } from 'components/admin/Section';
import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal, {
  ModalContentContainer,
  Content,
  ButtonsWrapper,
} from 'components/UI/Modal';
import Warning from 'components/UI/Warning';
import VerticalCenterer from 'components/VerticalCenterer';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { isNilOrError, byId } from 'utils/helperUtils';

import messages from './messages';
import tracks from './tracks';

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

    const [
      projectAllowedInputTopicIdToDelete,
      setProjectAllowedInputTopicIdToDelete,
    ] = useState<string | null>(null);
    const { data: allowedInputTopics } = useProjectAllowedInputTopics({
      projectId,
    });
    const { mutate: deleteProjectAllowedInputTopic, isLoading } =
      useDeleteAllowedProjectInputTopic({ projectId });

    const { mutate: reorderProjectAllowedInputTopic } =
      useReorderProjectAllowedInputTopics({ projectId });

    const topicIds = useMemo(
      () => getTopicIds(allowedInputTopics?.data),
      [allowedInputTopics]
    );

    const { data: topics } = useTopics();

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
        deleteProjectAllowedInputTopic(projectAllowedInputTopicIdToDelete, {
          onSuccess: () => {
            trackEventByName(tracks.projectTagsEdited, { projectId });
            setShowConfirmationModal(false);
            setProjectAllowedInputTopicIdToDelete(null);
          },
        });
      }
    };

    const handleReorderTopicProject = (
      projectAllowedInputTopicId: string,
      newOrder: number
    ) => {
      reorderProjectAllowedInputTopic({
        id: projectAllowedInputTopicId,
        ordering: newOrder,
      });
    };

    const closeSendConfirmationModal = () => {
      setShowConfirmationModal(false);
      setProjectAllowedInputTopicIdToDelete(null);
    };

    if (
      allowedInputTopics &&
      !isNilOrError(topicsById) &&
      allowedInputTopics.data.length > 0 &&
      allowedInputTopics.data.length === Object.keys(topicsById).length
    ) {
      const isLastSelectedTopic = allowedInputTopics.data.length === 1;

      const getTitle = ({ relationships }: IProjectAllowedInputTopicData) => {
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
                    <StyledLink to={`/admin/projects/${projectId}/form`}>
                      <FormattedMessage {...messages.inputForm} />
                    </StyledLink>
                  ),
                }}
              />
            </StyledWarning>
          )}
          <SortableList
            items={allowedInputTopics.data}
            onReorder={handleReorderTopicProject}
            className="projects-list e2e-admin-projects-list"
            id="e2e-admin-published-projects-list"
            key={allowedInputTopics.data.length}
          >
            {({ itemsList, handleDragRow, handleDropRow }) => (
              <>
                {itemsList.map(
                  (
                    projectAllowedInputTopic: IProjectAllowedInputTopicData,
                    index: number
                  ) => (
                    <SortableRow
                      id={projectAllowedInputTopic.id}
                      key={projectAllowedInputTopic.id}
                      index={index}
                      moveRow={handleDragRow}
                      dropRow={handleDropRow}
                      isLastItem={index === allowedInputTopics.data.length - 1}
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
                      <ButtonWithLink
                        onClick={handleProjectTopicDelete(
                          projectAllowedInputTopic.id
                        )}
                        buttonStyle="text"
                        icon="delete"
                        disabled={isLastSelectedTopic}
                        id="e2e-project-topic-delete-button"
                      >
                        <FormattedMessage {...messages.delete} />
                      </ButtonWithLink>
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
                <ButtonWithLink
                  buttonStyle="secondary-outlined"
                  onClick={closeSendConfirmationModal}
                >
                  <FormattedMessage {...messages.cancel} />
                </ButtonWithLink>
                <ButtonWithLink
                  buttonStyle="delete"
                  onClick={handleProjectTopicDeletionConfirm}
                  processing={isLoading}
                  id="e2e-project-topic-delete-confirm-button"
                >
                  <FormattedMessage {...messages.delete} />
                </ButtonWithLink>
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
