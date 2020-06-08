import React, { memo, FormEvent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';
import { withRouter, WithRouterProps } from 'react-router';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';

// components
import Button from 'components/UI/Button';
import { SortableList, SortableRow } from 'components/admin/ResourceList';
import { RowContent, RowContentInner, RowTitle } from '../../components/StyledComponents';
import Warning from 'components/UI/Warning';

// services
import { ITopicData } from 'services/topics';
import { deleteProjectTopic, reorderProjectTopic } from 'services/projectTopics';

// hooks
import useProjectTopics from 'hooks/useProjectTopics';

const StyledWarning = styled(Warning)`
  margin-bottom: 20px;
`;

interface Props {}

const SortableProjectTopicList = memo(({
  params: { projectId },
  intl: { formatMessage }
}: Props & WithRouterProps & InjectedIntlProps) => {

  const handleRemoveSelectedTopic = (topicId: string) => (event: FormEvent) => {
    event.preventDefault();
    const deleteMessage = formatMessage(messages.topicDeletionConfirmation);

    if (window.confirm(deleteMessage)) {
      deleteProjectTopic(projectId, topicId);
    }
  };

  const handleReorderTopicProject = (topicId, newOrder) => {
    reorderProjectTopic(projectId, topicId, newOrder);
  };

  const projectTopics = useProjectTopics({ projectId, sort: 'custom' });

  if (!isNilOrError(projectTopics)) {
    const isLastSelectedTopic = projectTopics.length === 1;

    return (
      <>
        {isLastSelectedTopic &&
          <StyledWarning>
            <FormattedMessage {...messages.fewerThanOneTopicForbidden} />
          </StyledWarning>
        }
        <SortableList
          items={projectTopics}
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
                  lastItem={(index === projectTopics.length - 1)}
                >
                  <RowContent>
                    <RowContentInner className="expand primary">
                      <RowTitle value={topic.attributes.title_multiloc} />
                    </RowContentInner>
                  </RowContent>
                  <Button
                    onClick={handleRemoveSelectedTopic(topic.id)}
                    buttonStyle="text"
                    icon="delete"
                    disabled={isLastSelectedTopic}
                    id="e2e-remove-project-topic-button"
                  >
                    <FormattedMessage {...messages.remove} />
                  </Button>
                </SortableRow>
              );
            }))
          }
        </SortableList>
      </>
    );
  }

  return null;
});

export default withRouter(injectIntl(SortableProjectTopicList));
