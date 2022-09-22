import React from 'react';
import { FacebookShareButton } from 'react-share';
import { Medium } from '../utils';

// i18n
import { Box, Icon } from '@citizenlab/cl2-component-library';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import messages from '../messages';

// style
import { darken } from 'polished';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

interface Props {
  url: string;
  facebookMessage: string;
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
  facebookMessage,
  url,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const handleClick = () => {
    trackClick('facebook');
  };

  const trackClick = (medium: Medium) => () => {
    const properties = { network: medium };
    trackEventByName(tracks.shareButtonClicked.name, properties);
  };
  return (
    <StyledBox onClick={handleClick}>
      <FacebookShareButton
        quote={facebookMessage}
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
