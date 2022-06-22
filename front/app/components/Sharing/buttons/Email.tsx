import React from 'react';
import { clickSocialSharingLink, Medium } from '../utils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';
import { Button } from '@citizenlab/cl2-component-library';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';
interface Props {
  emailSubject: string | undefined;
  emailBody: string | undefined;
  isDropdownStyle: boolean;
  isInModal: boolean | undefined;
}

const Email = ({
  emailSubject,
  emailBody,
  isInModal,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const href = `mailto:?subject=${emailSubject}&body=${emailBody}`;

  const handleClick = (href: string) => () => {
    clickSocialSharingLink(href);
    trackClick('email');
  };
  const trackClick = (medium: Medium) => () => {
    const properties = isInModal
      ? { modal: 'true', network: medium }
      : { network: medium };

    trackEventByName(tracks.shareButtonClicked.name, properties);
  };

  return (
    <Button
      onClick={handleClick(href)}
      aria-label={formatMessage(messages.shareByEmail)}
      icon="email"
      iconSize="20px"
      style={{ cursor: 'pointer' }}
      width="48px"
    />
  );
};

export default injectIntl(Email);
