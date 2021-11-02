import React, { memo } from 'react';
import { IStatusChangeOnVotedIdeaNotificationData } from 'services/notifications';
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import NotificationWrapper from '../NotificationWrapper';
import useIdea from 'hooks/useIdea';
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import { isNilOrError } from 'utils/helperUtils';
import { getInputTerm } from 'services/participationContexts';
import { getInputTermMessage } from 'utils/i18n';

interface Props {
  notification: IStatusChangeOnVotedIdeaNotificationData;
}

const StatusChangeOnVotedIdeaNotification = memo<Props>((props) => {
  const { notification } = props;
  const idea = useIdea({ ideaSlug: notification.attributes.post_slug });
  const projectId = !isNilOrError(idea)
    ? idea.relationships.project.data.id
    : null;
  const project = useProject({ projectId });
  const phases = usePhases(projectId);

  if (!isNilOrError(project)) {
    const inputTerm = getInputTerm(
      project.attributes.process_type,
      project,
      phases
    );
    return (
      <NotificationWrapper
        linkTo={`/ideas/${notification.attributes.post_slug}`}
        timing={notification.attributes.created_at}
        icon="notification_status"
        isRead={!!notification.attributes.read_at}
      >
        <FormattedMessage
          {...getInputTermMessage(inputTerm, {
            idea: messages.statusChangeOnVotedIdea,
            option: messages.statusChangeOnVotedOption,
            project: messages.statusChangeOnVotedProject,
            question: messages.statusChangeOnVotedQuestion,
            issue: messages.statusChangeOnVotedIssue,
            contribution: messages.statusChangeOnVotedContribution,
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

export default StatusChangeOnVotedIdeaNotification;
