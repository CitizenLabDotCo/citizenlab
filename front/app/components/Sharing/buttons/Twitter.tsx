import React from 'react';
import { TwitterButton } from 'react-social';
import { clickSocialSharingLink, Medium } from '../utils';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// components
import { Box, Button } from '@citizenlab/cl2-component-library';

// style
import { colors } from 'utils/styleUtils';
import { darken } from 'polished';

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

  return (
    <TwitterButton
      message={twitterMessage}
      url={url}
      onClick={handleClick}
      sharer={true}
      aria-label={formatMessage(messages.shareOnTwitter)}
      style={{ padding: '0px', margin: '0px' }}
    >
      <Box flex="1 1 1" display="flex" style={{ cursor: 'pointer' }}>
        <Button
          aria-label={formatMessage(messages.shareOnTwitter)}
          bgColor={isDropdownStyle ? '#fff' : colors.twitter}
          width="100%"
          icon="twitter"
          iconColor={isDropdownStyle ? colors.twitter : '#fff'}
          iconSize="20px"
          text={
            isDropdownStyle ? (
              <FormattedMessage {...messages.twitter} />
            ) : undefined
          }
          textColor={colors.grey}
          textHoverColor={isDropdownStyle ? colors.grey : '#fff'}
          iconHoverColor={isDropdownStyle ? colors.twitter : '#fff'}
          justify={isDropdownStyle ? 'left' : 'center'}
          bgHoverColor={
            isDropdownStyle
              ? darken(0.06, '#fff')
              : darken(0.06, colors.twitter)
          }
        />
      </Box>
    </TwitterButton>
  );
};

export default injectIntl(Twitter);
