import React from 'react';

import useAuthUser from 'api/me/useAuthUser';

import { FormattedMessage } from 'utils/cl-intl';

import DismissibleNotice from './DismissibleNotice';
import messages from './messages';
import ProfileSettingsLink from './ProfileSettingsLink';

const TurnOnNotice = () => {
  const { data: authUser } = useAuthUser();
  const attributes = authUser?.data.attributes;

  const offered =
    !!attributes?.offered_early_access_features?.project_backoffice_redesign;
  const optedIn = !!attributes?.early_access_opt_ins?.includes(
    'project_backoffice_redesign'
  );

  if (!offered || optedIn) return null;

  return (
    <DismissibleNotice storageKey="project_backoffice_redesign_turn_on_notice_dismissed">
      <FormattedMessage
        {...messages.turnOnNotice}
        values={{
          b: (chunks) => <b>{chunks}</b>,
          profileSettingsLink: <ProfileSettingsLink />,
        }}
      />
    </DismissibleNotice>
  );
};

export default TurnOnNotice;
