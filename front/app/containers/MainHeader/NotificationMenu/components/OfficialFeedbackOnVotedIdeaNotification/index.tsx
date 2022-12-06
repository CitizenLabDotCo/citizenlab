import React, { memo } from 'react';
import useIdea from 'hooks/useIdea';
import usePhases from 'hooks/usePhases';
import useProject from 'hooks/useProject';
import { IOfficialFeedbackOnVotedIdeaNotificationData } from 'services/notifications';
import { getInputTerm } from 'services/participationContexts';
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { getInputTermMessage } from 'utils/i18n';
import T from 'components/T';
// i18n
import messages from '../../messages';
// components
import NotificationWrapper from '../NotificationWrapper';

interface Props {
  notification: IOfficialFeedbackOnVotedIdeaNotificationData;
}

const OfficialFeedbackOnVotedIdeaNotification = memo<Props>((props) => {
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
        icon="comments"
        isRead={!!notification.attributes.read_at}
      >
        <FormattedMessage
          {...getInputTermMessage(inputTerm, {
            idea: messages.officialFeedbackOnVotedIdea,
            option: messages.officialFeedbackOnVotedOption,
            project: messages.officialFeedbackOnVotedProject,
            question: messages.officialFeedbackOnVotedQuestion,
            issue: messages.officialFeedbackOnVotedIssue,
            contribution: messages.officialFeedbackOnVotedContribution,
          })}
          values={{
            officialName: (
              <T value={notification.attributes.official_feedback_author} />
            ),
          }}
        />
      </NotificationWrapper>
    );
  }

  return null;
});

export default OfficialFeedbackOnVotedIdeaNotification;
