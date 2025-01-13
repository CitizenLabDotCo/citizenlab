import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { lighten } from 'polished';
import { TwitterShareButton, XIcon } from 'react-share';
import styled from 'styled-components';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import tracks from '../tracks';
import { Medium } from '../utils';

interface Props {
  url: string;
  twitterMessage: string;
}

const StyledBox = styled(Box)`
  display: flex;
  background-color: ${colors.black};
  border-radius: 3px;
  height: 40px;
  width: 40px;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background-color: ${lighten(0.3, colors.black)};
  }
`;

const Twitter = ({ url, twitterMessage }: Props) => {
  const { formatMessage } = useIntl();
  const trackClick = (medium: Medium) => () => {
    const properties = { network: medium };
    trackEventByName(tracks.shareButtonClicked, properties);
  };

  return (
    <StyledBox>
      <TwitterShareButton
        title={twitterMessage}
        url={url}
        onClick={trackClick('twitter')}
        aria-label={formatMessage(messages.shareOnTwitter)}
      >
        <XIcon size={32} round={true} />
      </TwitterShareButton>
    </StyledBox>
  );
};

export default Twitter;
