import React, { memo } from 'react';

import useIdeaBySlug from 'api/ideas/useIdeaBySlug';
import { IInvitationToCosponsorIdeaNotificationData } from 'api/notifications/types';
import usePhases from 'api/phases/usePhases';
import { getInputTerm } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError, stopPropagation } from 'utils/helperUtils';
import { getInputTermMessage } from 'utils/i18n';

import messages from '../../messages';
import { DeletedUser } from '../Notification';
import NotificationWrapper from '../NotificationWrapper';

interface Props {
  notification: IInvitationToCosponsorIdeaNotificationData;
}

const InvitationToCosponsorIdeaNotification = memo<Props>((props) => {
  const { notification } = props;

  const { data: idea } = useIdeaBySlug(notification.attributes.post_slug);
  const projectId = !isNilOrError(idea)
    ? idea.data.relationships.project.data.id
    : undefined;
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);

  if (!isNilOrError(project)) {
    const inputTerm = getInputTerm(phases?.data);
    const deletedUser =
      isNilOrError(notification.attributes.initiating_user_first_name) ||
      isNilOrError(notification.attributes.initiating_user_slug);
    return (
      <NotificationWrapper
        linkTo={`/ideas/${notification.attributes.post_slug}`}
        timing={notification.attributes.created_at}
        icon="label"
        isRead={!!notification.attributes.read_at}
      >
        <FormattedMessage
          {...getInputTermMessage(inputTerm, {
            idea: messages.invitationToCosponsorIdea,
            option: messages.invitationToCosponsorOption,
            project: messages.invitationToCosponsorProject,
            question: messages.invitationToCosponsorQuestion,
            issue: messages.invitationToCosponsorIssue,
            contribution: messages.invitationToCosponsorContribution,
            // initiative: messages.invitationToCosponsorInitiative,
            // petition: messages.invitationToCosponsorPetition,
            // proposal: messages.invitationToCosponsorProposal,
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

export default InvitationToCosponsorIdeaNotification;
