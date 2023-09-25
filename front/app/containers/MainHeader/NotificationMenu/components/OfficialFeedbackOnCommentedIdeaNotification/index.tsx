import React, { memo } from 'react';
import useIdeaBySlug from 'api/ideas/useIdeaBySlug';
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import { IOfficialFeedbackOnCommentedIdeaNotificationData } from 'api/notifications/types';
import { isNilOrError } from 'utils/helperUtils';
import { getInputTerm } from 'utils/participationContexts';

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
