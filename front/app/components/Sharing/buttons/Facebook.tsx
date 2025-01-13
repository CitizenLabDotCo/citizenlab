import React from 'react';

import { Box, Icon, colors } from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import { WrappedComponentProps } from 'react-intl';
import { FacebookShareButton } from 'react-share';
import styled from 'styled-components';

import { trackEventByName } from 'utils/analytics';
import { injectIntl } from 'utils/cl-intl';

import messages from '../messages';
import tracks from '../tracks';
import { Medium } from '../utils';

interface Props {
  url: string;
}

const StyledBox = styled(Box)`
  display: flex;
  background-color: ${colors.facebook};
  border-radius: 3px;
  height: 40px;
  width: 40px;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background-color: ${darken(0.1, colors.facebook)};
  }
`;

const Facebook = ({
  url,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const handleClick = () => {
    trackClick('facebook');
  };

  const trackClick = (medium: Medium) => () => {
    const properties = { network: medium };
    trackEventByName(tracks.shareButtonClicked, properties);
  };
  return (
    <StyledBox onClick={handleClick}>
      <FacebookShareButton
        url={url}
        aria-label={formatMessage(messages.shareOnFacebook)}
      >
        <Icon name="facebook" width="20px" fill="white" />
      </FacebookShareButton>
    </StyledBox>
  );
  return null;
};

export default injectIntl(Facebook);
