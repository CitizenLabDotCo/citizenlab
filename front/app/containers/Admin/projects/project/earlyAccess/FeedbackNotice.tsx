import React from 'react';

import useDismissed from 'hooks/useDismissed';
import useEarlyAccess from 'hooks/useEarlyAccess';

import FeatureCallout from 'components/UI/FeatureCallout';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import ProfileSettingsLink from './ProfileSettingsLink';
import SlackChannelLink from './SlackChannelLink';

const FeedbackNotice = () => {
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
        <FormattedMessage
          {...messages.feedbackNoticeDescription}
          values={{
            profileSettingsLink: <ProfileSettingsLink />,
            slackChannelLink: <SlackChannelLink />,
          }}
        />
      }
      onDismiss={dismiss}
    />
  );
};

export default FeedbackNotice;
