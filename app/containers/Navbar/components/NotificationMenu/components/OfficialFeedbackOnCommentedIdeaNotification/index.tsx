import React, { memo } from 'react';
import useIdea from 'hooks/useIdea';
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import { IOfficialFeedbackOnCommentedIdeaNotificationData } from 'services/notifications';
import { isNilOrError } from 'utils/helperUtils';
import { getInputTerm } from 'services/participationContexts';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { getInputTermMessage } from 'utils/i18n';

// components
import NotificationWrapper from '../NotificationWrapper';
import T from 'components/T';

interface Props {
  notification: IOfficialFeedbackOnCommentedIdeaNotificationData;
}

const OfficialFeedbackOnCommentedIdeaNotification = memo(
  ({ notification }: Props) => {
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
              idea: messages.officialFeedbackOnCommentedIdea,
              option: messages.officialFeedbackOnCommentedOption,
              project: messages.officialFeedbackOnCommentedProject,
              question: messages.officialFeedbackOnCommentedQuestion,
              issue: messages.officialFeedbackOnCommentedIssue,
              contribution: messages.officialFeedbackOnCommentedContribution,
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
  }
);

export default OfficialFeedbackOnCommentedIdeaNotification;
