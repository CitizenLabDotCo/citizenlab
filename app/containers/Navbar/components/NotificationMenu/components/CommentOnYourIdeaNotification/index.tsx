import React, { memo } from 'react';
import { isNilOrError, stopPropagation } from 'utils/helperUtils';
import { DeletedUser } from '../Notification';

// data
import { ICommentOnYourIdeaNotificationData } from 'services/notifications';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import NotificationWrapper from '../NotificationWrapper';
import Link from 'utils/cl-router/Link';
import { getInputTermMessage } from 'utils/i18n';

// hooks
import useIdea from 'hooks/useIdea';
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';

// services
import { getInputTerm } from 'services/participationContexts';

interface Props {
  notification: ICommentOnYourIdeaNotificationData;
}

const CommentOnYourIdeaNotification = memo<Props>((props) => {
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
    const deletedUser =
      isNilOrError(notification.attributes.initiating_user_first_name) ||
      isNilOrError(notification.attributes.initiating_user_slug);

    return (
      <NotificationWrapper
        linkTo={`/ideas/${notification.attributes.post_slug}`}
        timing={notification.attributes.created_at}
        icon="comments"
        isRead={!!notification.attributes.read_at}
      >
        <FormattedMessage
          {...getInputTermMessage(inputTerm, {
            idea: messages.userCommentedOnYourIdea,
            option: messages.userCommentedOnYourOption,
            project: messages.userCommentedOnYourProject,
            question: messages.userCommentedOnYourQuestion,
            issue: messages.userCommentedOnYourIssue,
            contribution: messages.userCommentedOnYourContribution,
          })}
          values={{
            name: deletedUser ? (
              <DeletedUser>
                <FormattedMessage {...messages.deletedUser} />
              </DeletedUser>
            ) : (
              <Link
                to={`/profile/${notification.attributes.initiating_user_slug}`}
                onClick={stopPropagation}
              >
                {notification.attributes.initiating_user_first_name}
              </Link>
            ),
          }}
        />
      </NotificationWrapper>
    );
  }

  return null;
});

export default CommentOnYourIdeaNotification;
