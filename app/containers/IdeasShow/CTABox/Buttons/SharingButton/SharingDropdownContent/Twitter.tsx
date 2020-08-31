import React from 'react';
import styled from 'styled-components';
import { TwitterButton } from 'react-social';
import tracks from '../tracks';
import trackClickByEventName from './trackClickByEventName';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { Icon } from 'cl2-component-library';

const StyledIcon = styled(Icon)`
  margin-right: 10px;
  width: 22px;
  height: 17px;
  fill: #1da1f2;
`;

interface Props {
  twitterMessage: string;
  isLastItem: boolean;
  url: string;
}

const Twitter = ({
  url,
  twitterMessage,
  isLastItem,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  return (
    <TwitterButton
      message={twitterMessage}
      url={url}
      className={`sharingButton twitter ${isLastItem ? 'last' : ''}`}
      sharer={true}
      onClick={trackClickByEventName(tracks.clickTwitterShare.name)}
      aria-label={formatMessage(messages.shareOnTwitter)}
    >
      <StyledIcon name="twitter" />
      {'Twitter'}
    </TwitterButton>
  );
};

export default injectIntl(Twitter);
