import React from 'react';
import tracks from '../tracks';
import trackClickByEventName from './trackClickByEventName';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

interface Props {
  emailSubject: string;
  emailBody: string;
}

const handleClick = (_event) => {
  trackClickByEventName(tracks.clickEmailShare.name);
};

const Email = ({
  emailSubject,
  emailBody,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  return (
    <a
      className="sharingButton last email"
      href={`mailto:?subject=${emailSubject}&body=${emailBody}`}
      onClick={handleClick}
      role="button"
      aria-label={formatMessage(messages.shareByEmail)}
    >
      {/* <StyledIcon name="messenger" /> */}
    </a>
  );
};

export default injectIntl(Email);
