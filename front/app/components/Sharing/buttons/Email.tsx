import React from 'react';
import { clickSocialSharingLink, Medium } from '../utils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from '../messages';
import { Button } from '@citizenlab/cl2-component-library';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';
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

    trackEventByName(tracks.shareButtonClicked.name, properties);
  };

  return (
    <Button
      onClick={handleClick(href)}
      aria-label={formatMessage(messages.shareByEmail)}
      icon="email"
      iconSize="20px"
      width="40px"
      height="40px"
    />
  );
};

export default injectIntl(Email);
