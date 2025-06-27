import React from 'react';

import { Button } from '@citizenlab/cl2-component-library';
import { WrappedComponentProps } from 'react-intl';

import { trackEventByName } from 'utils/analytics';
import { injectIntl } from 'utils/cl-intl';

import messages from '../messages';
import tracks from '../tracks';
import { clickSocialSharingLink, Medium } from '../utils';
interface Props {
  emailSubject: string | undefined;
  emailBody: string | undefined;
  isDropdownStyle: boolean;
}

const Email = ({
  emailSubject,
  emailBody,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const href = `mailto:?subject=${emailSubject}&body=${emailBody}`;

  const handleClick = (href: string) => () => {
    clickSocialSharingLink(href);
    trackClick('email');
  };
  const trackClick = (medium: Medium) => () => {
    const properties = { network: medium };

    trackEventByName(tracks.shareButtonClicked, properties);
  };

  return (
    <Button
      onClick={handleClick(href)}
      ariaLabel={formatMessage(messages.shareByEmail)}
      icon="email"
      iconSize="20px"
      width="40px"
      height="40px"
    />
  );
};

export default injectIntl(Email);
