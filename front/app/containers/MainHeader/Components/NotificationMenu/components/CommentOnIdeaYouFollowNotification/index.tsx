import React, { memo } from 'react';

// data

import useIdeaBySlug from 'api/ideas/useIdeaBySlug';
import { ICommentOnIdeaYouFollowNotificationData } from 'api/notifications/types';
import usePhases from 'api/phases/usePhases';
import { getInputTerm } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { getInputTermMessage } from 'utils/i18n';

import messages from '../../messages';
import NotificationWrapper from '../NotificationWrapper';
import UserLink from '../UserLink';

interface Props {
  notification: ICommentOnIdeaYouFollowNotificationData;
}

const CommentOnIdeaYouFollowNotification = memo<Props>((props) => {
  const { notification } = props;
  const { data: idea } = useIdeaBySlug(notification.attributes.post_slug);
  const projectId = !isNilOrError(idea)
    ? idea.data.relationships.project.data.id
    : undefined;
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);

  if (!isNilOrError(project)) {
    const inputTerm = getInputTerm(phases?.data);

    return (
      <NotificationWrapper
        linkTo={`/ideas/${notification.attributes.post_slug}`}
        timing={notification.attributes.created_at}
        icon="comments"
        isRead={!!notification.attributes.read_at}
      >
        <FormattedMessage
          {...getInputTermMessage(inputTerm, {
            idea: messages.userCommentedOnIdeaYouFollow,
            option: messages.userCommentedOnOptionYouFollow,
            project: messages.userCommentedOnProjectYouFollow,
            question: messages.userCommentedOnQuestionYouFollow,
            issue: messages.userCommentedOnIssueYouFollow,
            contribution: messages.userCommentedOnContributionYouFollow,
            proposal: messages.userCommentedOnProposalYouFollow,
            initiative: messages.userCommentedOnInitiativeYouFollow,
            petition: messages.userCommentedOnPetitionYouFollow,
            comment: messages.userCommentedOnCommentYouFollow,
            statement: messages.userCommentedOnStatementYouFollow,
          })}
          values={{
            name: (
              <UserLink
                userName={notification.attributes.initiating_user_first_name}
                userSlug={notification.attributes.initiating_user_slug}
              />
            ),
          }}
        />
      </NotificationWrapper>
    );
  }

  return null;
});

export default CommentOnIdeaYouFollowNotification;
