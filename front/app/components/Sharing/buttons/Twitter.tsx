import React from 'react';
import { TwitterButton } from 'react-social';
import { clickSocialSharingLink, Medium } from '../utils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// components
import { Icon } from '@citizenlab/cl2-component-library';

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
    background-color: ${colors.twitter};
    border-radius: 3px;
    height: 40px;
    width: 48px;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: ${darken(0.1, colors.twitter)};
    }
  `;

  return (
    <StyledTwitterButton
      message={twitterMessage}
      url={url}
      onClick={handleClick}
      sharer={true}
      aria-label={formatMessage(messages.shareOnTwitter)}
      style={{ cursor: 'pointer' }}
    >
      <Icon fill="white" name="twitter" width="20px" />
    </StyledTwitterButton>
  );
};

export default injectIntl(Twitter);
