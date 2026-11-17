import React from 'react';

import Banner from 'design-system/Banner';
import IconButton from 'design-system/IconButton';

import useAuthUser from 'api/me/useAuthUser';

import useDismissed from 'hooks/useDismissed';
import useEarlyAccess from 'hooks/useEarlyAccess';

import featureCalloutMessages from 'components/UI/FeatureCallout/messages';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isSuperAdmin } from 'utils/permissions/roles';

import styles from './FeedbackNotice.module.css';
import messages from './messages';
import ProfileSettingsLink from './ProfileSettingsLink';
import SlackChannelLink from './SlackChannelLink';
import 'design-system/tokens.css';

const FeedbackNotice = () => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const { optedIn } = useEarlyAccess('project_backoffice_redesign');
  const { dismissed, dismiss } = useDismissed(
    'project_backoffice_redesign_feedback_notice_dismissed'
  );

  if (!optedIn || dismissed) return null;

  return (
    <div className={styles.notice}>
      <Banner tone="info">
        <span className={styles.message}>
          <strong className={styles.title}>
            <FormattedMessage {...messages.feedbackNoticeTitle} />
          </strong>{' '}
          {/* The Slack channel is internal, so only Go Vocal staff can open it. */}
          {isSuperAdmin(authUser) ? (
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
          )}
        </span>
      </Banner>
      <div className={styles.dismiss}>
        <IconButton
          icon="x-16"
          size={24}
          aria-label={formatMessage(featureCalloutMessages.dismiss)}
          onPress={dismiss}
        />
      </div>
    </div>
  );
};

export default FeedbackNotice;
