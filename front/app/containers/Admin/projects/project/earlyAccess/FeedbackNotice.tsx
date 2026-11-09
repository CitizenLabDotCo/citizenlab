import React from 'react';

import useAuthUser from 'api/me/useAuthUser';

import useDismissed from 'hooks/useDismissed';
import useEarlyAccess from 'hooks/useEarlyAccess';

import FeatureCallout from 'components/UI/FeatureCallout';

import { FormattedMessage } from 'utils/cl-intl';
import { isSuperAdmin } from 'utils/permissions/roles';

import messages from './messages';
import ProfileSettingsLink from './ProfileSettingsLink';
import SlackChannelLink from './SlackChannelLink';

const FeedbackNotice = () => {
  const { data: authUser } = useAuthUser();
  const { optedIn } = useEarlyAccess('project_backoffice_redesign');
  const { dismissed, dismiss } = useDismissed(
    'project_backoffice_redesign_feedback_notice_dismissed'
  );

  if (!optedIn || dismissed) return null;

  return (
    <FeatureCallout
      icon="info-outline"
      title={<FormattedMessage {...messages.feedbackNoticeTitle} />}
      description={
        // The Slack channel is internal, so only Go Vocal staff can open it.
        isSuperAdmin(authUser) ? (
          <FormattedMessage
            {...messages.feedbackNoticeDescription}
            values={{
              profileSettingsLink: <ProfileSettingsLink />,
              slackChannelLink: <SlackChannelLink />,
            }}
          />
        ) : (
          <FormattedMessage
            {...messages.feedbackNoticeDescriptionWithoutSlack}
            values={{ profileSettingsLink: <ProfileSettingsLink /> }}
          />
        )
      }
      onDismiss={dismiss}
    />
  );
};

export default FeedbackNotice;
