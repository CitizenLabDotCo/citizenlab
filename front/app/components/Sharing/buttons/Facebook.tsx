import React from 'react';
import { Medium } from '../utils';

import { isNilOrError } from 'utils/helperUtils';
import useAppConfiguration from 'hooks/useAppConfiguration';
import { FacebookShareButton } from 'react-share';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';
import { Box, Icon } from '@citizenlab/cl2-component-library';

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

const StyledBox = styled(Box)`
  display: flex;
  background-color: ${colors.facebook};
  border-radius: 3px;
  height: 40px;
  width: 48px;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background-color: ${darken(0.1, colors.facebook)};
  }
`;

const Facebook = ({
  facebookMessage,
  isInModal,
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

  if (!isNilOrError(tenant)) {
    const facebookConfig = tenant.data.attributes.settings?.facebook_login;
    if (facebookConfig?.allowed && facebookConfig?.enabled) {
      return (
        <StyledBox>
          <FacebookShareButton
            quote={facebookMessage}
            url={url}
            aria-label={formatMessage(messages.shareOnFacebook)}
          >
            <Box onClick={handleClick}>
              <Icon name="facebook" width="20px" fill="white" />
            </Box>
          </FacebookShareButton>
        </StyledBox>
      );
    }
  }
  return null;
};

export default injectIntl(Facebook);
