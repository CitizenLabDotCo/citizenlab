import React from 'react';
import styled from 'styled-components';
import tracks from '../tracks';
import trackClickByEventName from './trackClickByEventName';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { Icon } from 'cl2-component-library';
import { colors } from 'utils/styleUtils';

const StyledIcon = styled(Icon)`
  margin-right: 10px;
  width: 22px;
  height: 17px;
  fill: ${colors.secondaryText};
`;

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
      <StyledIcon name="email" />
      {'Email'}
    </a>
  );
};

export default injectIntl(Email);
