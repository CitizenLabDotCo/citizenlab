import React, { memo } from 'react';
import { IStatusChangeOnCommentedIdeaNotificationData } from 'api/notifications/types';
import T from 'components/T';
import NotificationWrapper from '../NotificationWrapper';
import useIdeaBySlug from 'api/ideas/useIdeaBySlug';
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import { isNilOrError } from 'utils/helperUtils';
import { getInputTerm } from 'utils/participationContexts';

// // i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import { getInputTermMessage } from 'utils/i18n';

interface Props {
  notification: IStatusChangeOnCommentedIdeaNotificationData;
}

const StatusChangeOnCommentedIdeaNotification = memo<Props>((props) => {
  const { notification } = props;
  const { data: idea } = useIdeaBySlug(notification.attributes.post_slug);
  const projectId = !isNilOrError(idea)
    ? idea.data.relationships.project.data.id
    : undefined;
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);

  if (project) {
    const inputTerm = getInputTerm(
      project.data.attributes.process_type,
      project.data,
      phases?.data
    );
    return (
      <NotificationWrapper
        linkTo={`/ideas/${notification.attributes.post_slug}`}
        timing={notification.attributes.created_at}
        icon="label"
        isRead={!!notification.attributes.read_at}
      >
        <FormattedMessage
          {...getInputTermMessage(inputTerm, {
            idea: messages.statusChangeOnCommentedIdea,
            option: messages.statusChangeOnCommentedOption,
            project: messages.statusChangeOnCommentedProject,
            question: messages.statusChangeOnCommentedQuestion,
            issue: messages.statusChangeOnCommentedIssue,
            contribution: messages.statusChangeOnCommentedContribution,
          })}
          values={{
            status: (
              <T value={notification.attributes.idea_status_title_multiloc} />
            ),
          }}
        />
      </NotificationWrapper>
    );
  }

  return null;
});

export default StatusChangeOnCommentedIdeaNotification;
