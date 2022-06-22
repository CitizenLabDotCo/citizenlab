import React from 'react';
import { TwitterButton } from 'react-social';
import { clickSocialSharingLink, Medium } from '../utils';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// components
import { Box, Icon, Text } from '@citizenlab/cl2-component-library';

// style
import { colors } from 'utils/styleUtils';
import { darken } from 'polished';
import styled from 'styled-components';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

interface Props {
  url: string;
  twitterMessage: string;
  isDropdownStyle: boolean;
  isInModal: boolean | undefined;
}

const Twitter = ({
  isDropdownStyle,
  url,
  twitterMessage,
  isInModal,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const handleClick = (href: string) => () => {
    clickSocialSharingLink(href);
    trackClick('twitter');
  };

  const trackClick = (medium: Medium) => () => {
    const properties = isInModal
      ? { modal: 'true', network: medium }
      : { network: medium };

    trackEventByName(tracks.shareButtonClicked.name, properties);
  };

  const StyledTwitterButton = styled(TwitterButton)`
    display: flex;
    flex-basis: 1;
    justify-content: space-between;
    background-color: ${isDropdownStyle ? '#fff' : colors.twitter};
    border-radius: 3px;
    height: 40px;
    width: ${isDropdownStyle ? '100%' : '56px'};
    align-items: center;
    justify-content: ${isDropdownStyle ? 'left' : 'center'};

    &:hover {
      background-color: ${isDropdownStyle
        ? darken(0.06, '#fff')
        : darken(0.06, colors.twitter)};
    }
  `;

  const StyledIcon = styled(Icon)`
    fill: ${isDropdownStyle ? colors.twitter : '#fff'};

    &:hover {
      fill: white;
    }
  `;

  return (
    <StyledTwitterButton
      message={twitterMessage}
      url={url}
      onClick={handleClick}
      sharer={true}
      aria-label={formatMessage(messages.shareOnTwitter)}
      style={{ padding: '0px', margin: '0px', cursor: 'pointer' }}
    >
      <Box flex="1 1 1" display="flex" style={{ cursor: 'pointer' }}>
        <Text color="grey">
          <StyledIcon
            ml={isDropdownStyle ? '16px' : '0px'}
            mr={isDropdownStyle ? '12px' : '0px'}
            fill="white"
            name="twitter"
            width="20px"
          />
          {isDropdownStyle && <FormattedMessage {...messages.twitter} />}
        </Text>
      </Box>
    </StyledTwitterButton>
  );
};

export default injectIntl(Twitter);
