import React from 'react';

import { Box, Icon, colors } from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import { WrappedComponentProps } from 'react-intl';
import { TwitterShareButton } from 'react-share';
import styled from 'styled-components';

import { trackEventByName } from 'utils/analytics';
import { injectIntl } from 'utils/cl-intl';

import messages from '../messages';
import tracks from '../tracks';
import { Medium } from '../utils';

interface Props {
  url: string;
  twitterMessage: string;
}

const StyledBox = styled(Box)`
  display: flex;
  background-color: ${colors.twitter};
  border-radius: 3px;
  height: 40px;
  width: 40px;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background-color: ${darken(0.1, colors.twitter)};
  }
`;

const Twitter = ({
  url,
  twitterMessage,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const trackClick = (medium: Medium) => () => {
    const properties = { network: medium };
    trackEventByName(tracks.shareButtonClicked.name, properties);
  };

  return (
    <StyledBox>
      <TwitterShareButton
        title={twitterMessage}
        url={url}
        onClick={trackClick('twitter')}
        aria-label={formatMessage(messages.shareOnTwitter)}
      >
        <Icon fill="white" name="twitter" width="20px" />
      </TwitterShareButton>
    </StyledBox>
  );
};

export default injectIntl(Twitter);
