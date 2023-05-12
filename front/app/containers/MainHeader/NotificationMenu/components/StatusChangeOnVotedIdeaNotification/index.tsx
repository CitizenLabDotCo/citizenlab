import React, { memo } from 'react';
import { IStatusChangeOnVotedIdeaNotificationData } from 'services/notifications';
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import NotificationWrapper from '../NotificationWrapper';
import useIdeaBySlug from 'api/ideas/useIdeaBySlug';
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'hooks/usePhases';
import { isNilOrError } from 'utils/helperUtils';
import { getInputTerm } from 'services/participationContexts';
import { getInputTermMessage } from 'utils/i18n';

interface Props {
  notification: IStatusChangeOnVotedIdeaNotificationData;
}

const StatusChangeOnVotedIdeaNotification = memo<Props>((props) => {
  const { notification } = props;
  const { data: idea } = useIdeaBySlug(notification.attributes.post_slug);
  const projectId = !isNilOrError(idea)
    ? idea.data.relationships.project.data.id
    : null;
  const { data: project } = useProjectById(projectId);
  const phases = usePhases(projectId);

  if (project) {
    const inputTerm = getInputTerm(
      project.data.attributes.process_type,
      project.data,
      phases
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
