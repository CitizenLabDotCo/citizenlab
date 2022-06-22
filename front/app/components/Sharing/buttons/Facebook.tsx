import React from 'react';
import { Medium } from '../utils';

import { isNilOrError } from 'utils/helperUtils';
import useAppConfiguration from 'hooks/useAppConfiguration';
import { FacebookButton } from 'react-social';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';
import { Box, Text, Icon } from '@citizenlab/cl2-component-library';

// style
import { colors } from 'utils/styleUtils';
import { darken } from 'polished';
import styled from 'styled-components';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

interface Props {
  isDropdownStyle: boolean;
  url: string;
  isInModal: boolean | undefined;
  facebookMessage: string;
}

const Facebook = ({
  facebookMessage,
  isInModal,
  isDropdownStyle,
  url,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const tenant = useAppConfiguration();

  const handleClick = () => {
    trackClick('facebook');
  };

  const trackClick = (medium: Medium) => () => {
    const properties = isInModal
      ? { modal: 'true', network: medium }
      : { network: medium };

    trackEventByName(tracks.shareButtonClicked.name, properties);
  };

  const StyledFacebookButton = styled(FacebookButton)`
    display: flex;
    flex-basis: 1;
    justify-content: space-between;
    background-color: ${isDropdownStyle ? '#fff' : colors.facebook};
    border-radius: 3px;
    height: 40px;
    width: ${isDropdownStyle ? '100%' : '56px'};
    align-items: center;
    justify-content: ${isDropdownStyle ? 'left' : 'center'};

    &:hover {
      background-color: ${isDropdownStyle
        ? darken(0.06, '#fff')
        : darken(0.06, colors.facebook)};
    }
  `;

  const StyledIcon = styled(Icon)`
    fill: ${isDropdownStyle ? colors.twitter : '#fff'};

    &:hover {
      fill: white;
    }
  `;

  if (!isNilOrError(tenant)) {
    const facebookConfig = tenant.data.attributes.settings?.facebook_login;

    if (
      facebookConfig?.allowed &&
      facebookConfig?.enabled &&
      facebookConfig?.app_id
    ) {
      return (
        <StyledFacebookButton
          message={facebookMessage}
          appId={facebookConfig.app_id}
          url={url}
          sharer={true}
          aria-label={formatMessage(messages.shareOnFacebook)}
        >
          <Box
            onClick={handleClick}
            flex="1 1 1"
            display="flex"
            style={{ cursor: 'pointer' }}
          >
            <Text color="grey">
              <StyledIcon
                ml={isDropdownStyle ? '12px' : '0px'}
                mr={isDropdownStyle ? '12px' : '0px'}
                fill="white"
                name="facebook"
                width="20px"
              />
              {isDropdownStyle && <FormattedMessage {...messages.facebook} />}
            </Text>
          </Box>
        </StyledFacebookButton>
      );
    }
  }

  return null;
};

export default injectIntl(Facebook);
