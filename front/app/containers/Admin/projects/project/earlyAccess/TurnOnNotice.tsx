import React from 'react';

import useDismissed from 'hooks/useDismissed';
import useEarlyAccess from 'hooks/useEarlyAccess';

import FeatureCallout from 'components/UI/FeatureCallout';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import ProfileSettingsLink from './ProfileSettingsLink';

const TurnOnNotice = () => {
  const { offered, optedIn } = useEarlyAccess('project_backoffice_redesign');
  const { dismissed, dismiss } = useDismissed(
    'project_backoffice_redesign_turn_on_notice_dismissed'
  );

  if (!offered || optedIn || dismissed) return null;

  return (
    <FeatureCallout
      icon="info-outline"
      title={<FormattedMessage {...messages.turnOnNoticeTitle} />}
      description={
        <FormattedMessage
          {...messages.turnOnNoticeDescription}
          values={{ profileSettingsLink: <ProfileSettingsLink /> }}
        />
      }
      onDismiss={dismiss}
    />
  );
};

export default TurnOnNotice;
