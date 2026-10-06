import React from 'react';

import useAuthUser from 'api/me/useAuthUser';

import ProjectBackofficeFeedbackLink from 'components/admin/ProjectBackofficeFeedbackLink';

import { FormattedMessage } from 'utils/cl-intl';

import DismissibleNotice from './DismissibleNotice';
import messages from './messages';
import ProfileSettingsLink from './ProfileSettingsLink';

const FeedbackNotice = () => {
  const { data: authUser } = useAuthUser();

  const optedIn = !!authUser?.data.attributes.early_access_opt_ins?.includes(
    'project_backoffice_redesign'
  );

  if (!optedIn) return null;

  return (
    <DismissibleNotice storageKey="project_backoffice_redesign_feedback_notice_dismissed">
      <FormattedMessage
        {...messages.feedbackNotice}
        values={{
          b: (chunks) => <b>{chunks}</b>,
          profileSettingsLink: <ProfileSettingsLink />,
          slackChannelLink: <ProjectBackofficeFeedbackLink />,
        }}
      />
    </DismissibleNotice>
  );
};

export default FeedbackNotice;
