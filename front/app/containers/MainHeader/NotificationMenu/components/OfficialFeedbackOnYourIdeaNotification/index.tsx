import React, { memo } from 'react';
import useIdea from 'hooks/useIdea';
import usePhases from 'hooks/usePhases';
import useProject from 'hooks/useProject';
import { IOfficialFeedbackOnYourIdeaNotificationData } from 'services/notifications';
import { getInputTerm } from 'services/participationContexts';
import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';
import { getInputTermMessage } from 'utils/i18n';
import T from 'components/T';
// i18n
import messages from '../../messages';
// components
import NotificationWrapper from '../NotificationWrapper';

interface Props {
  notification: IOfficialFeedbackOnYourIdeaNotificationData;
}

const OfficialFeedbackOnYourIdeaNotification = memo<Props>((props) => {
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
            idea: messages.officialFeedbackOnYourIdea2,
            option: messages.officialFeedbackOnYourOption,
            project: messages.officialFeedbackOnYourProject,
            question: messages.officialFeedbackOnYourQuestion,
            issue: messages.officialFeedbackOnYourIssue,
            contribution: messages.officialFeedbackOnYourContribution,
          })}
          values={{
            officialName: (
              <T value={notification.attributes.official_feedback_author} />
            ),
            idea: (
              <Link to={`/ideas/${notification.attributes.post_slug}`}>
                <T value={notification.attributes.post_title_multiloc} />
              </Link>
            ),
          }}
        />
      </NotificationWrapper>
    );
  }

  return null;
});

export default OfficialFeedbackOnYourIdeaNotification;
