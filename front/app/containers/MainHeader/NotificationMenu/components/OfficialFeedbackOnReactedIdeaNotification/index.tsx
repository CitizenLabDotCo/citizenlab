import React, { memo } from 'react';
import useIdeaBySlug from 'api/ideas/useIdeaBySlug';
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import { isNilOrError } from 'utils/helperUtils';
import { getInputTerm } from 'utils/participationContexts';

import { IOfficialFeedbackOnReactedIdeaNotificationData } from 'api/notifications/types';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { getInputTermMessage } from 'utils/i18n';

// components
import NotificationWrapper from '../NotificationWrapper';
import T from 'components/T';

interface Props {
  notification: IOfficialFeedbackOnReactedIdeaNotificationData;
}

const OfficialFeedbackOnReactedIdeaNotification = memo<Props>((props) => {
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
        icon="comments"
        isRead={!!notification.attributes.read_at}
      >
        <FormattedMessage
          {...getInputTermMessage(inputTerm, {
            idea: messages.officialFeedbackOnReactedIdea,
            option: messages.officialFeedbackOnReactedOption,
            project: messages.officialFeedbackOnReactedProject,
            question: messages.officialFeedbackOnReactedQuestion,
            issue: messages.officialFeedbackOnReactedIssue,
            contribution: messages.officialFeedbackOnReactedContribution,
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

export default OfficialFeedbackOnReactedIdeaNotification;
