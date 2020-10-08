import React from 'react';
import styled from 'styled-components';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { Icon } from 'cl2-component-library';

const StyledIcon = styled(Icon)`
  width: 22px;
  height: 18px;
  margin-right: 10px;
  fill: rgba(0, 120, 255, 1);
`;

interface Props {
  onClick: (medium: Medium, href?: string) => void;
  url: string;
}

const Messenger = ({
  onClick,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const handleClick = () => {
    onClick(
      'messenger',
      `fb-messenger://share/?link=${encodeURIComponent(
        addUtmToUrl('messenger', url)
      )}&app_id=${facebookAppId}`
    );
  };
  return (
    <button
      className="sharingButton messenger"
      onClick={handleClick}
      aria-label={formatMessage(messages.shareViaMessenger)}
    >
      <StyledIcon ariaHidden name="messenger" />
      <span aria-hidden>{'Messenger'}</span>
    </button>
  );
};

export default injectIntl(Messenger);
