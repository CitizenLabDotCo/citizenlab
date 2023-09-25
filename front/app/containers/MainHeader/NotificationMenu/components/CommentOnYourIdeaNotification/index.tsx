import React, { memo } from 'react';
import { isNilOrError, stopPropagation } from 'utils/helperUtils';
import { DeletedUser } from '../Notification';

// data
import { ICommentOnYourIdeaNotificationData } from 'api/notifications/types';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import NotificationWrapper from '../NotificationWrapper';
import Link from 'utils/cl-router/Link';
import { getInputTermMessage } from 'utils/i18n';

// hooks
import useIdeaBySlug from 'api/ideas/useIdeaBySlug';
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';

// services
import { getInputTerm } from 'utils/participationContexts';

interface Props {
  notification: ICommentOnYourIdeaNotificationData;
}

const CommentOnYourIdeaNotification = memo<Props>((props) => {
  const { notification } = props;
  const { data: idea } = useIdeaBySlug(notification.attributes.post_slug);
  const projectId = !isNilOrError(idea)
    ? idea.data.relationships.project.data.id
    : undefined;
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);

  if (!isNilOrError(project)) {
    const inputTerm = getInputTerm(
      project.data.attributes.process_type,
      project.data,
      phases?.data
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
