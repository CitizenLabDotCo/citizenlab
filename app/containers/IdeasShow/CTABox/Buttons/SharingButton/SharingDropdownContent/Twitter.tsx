import React from 'react';
import { TwitterButton } from 'react-social';
import tracks from '../tracks';
import trackClickByEventName from './trackClickByEventName';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

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
      {/* <StyledIcon name="twitter" /> */}
    </TwitterButton>
  );
};

export default injectIntl(Twitter);
