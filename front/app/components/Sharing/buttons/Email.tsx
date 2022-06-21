import React from 'react';
import { clickSocialSharingLink, Medium } from '../utils';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';
import { Box, Button } from '@citizenlab/cl2-component-library';

// style
import { colors } from 'utils/styleUtils';
import { darken } from 'polished';
import { useTheme } from 'styled-components';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';
interface Props {
  emailSubject: string | undefined;
  emailBody: string | undefined;
  isDropdownStyle: boolean;
  isInModal: boolean | undefined;
}

const Email = ({
  emailSubject,
  emailBody,
  isDropdownStyle,
  isInModal,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const theme: any = useTheme();
  const href = `mailto:?subject=${emailSubject}&body=${emailBody}`;

  const handleClick = (href: string) => () => {
    clickSocialSharingLink(href);
    trackClick('email');
  };
  const trackClick = (medium: Medium) => () => {
    const properties = isInModal
      ? { modal: 'true', network: medium }
      : { network: medium };

    trackEventByName(tracks.shareButtonClicked.name, properties);
  };

  return (
    <Box
      onClick={trackClick('email')}
      flex="1 1 1"
      display="flex"
      style={{ cursor: 'pointer' }}
    >
      <Button
        onClick={handleClick(href)}
        aria-label={formatMessage(messages.shareByEmail)}
        bgColor={isDropdownStyle ? '#fff' : theme.colorMain}
        width="100%"
        icon="email"
        iconColor={isDropdownStyle ? colors.secondaryText : '#fff'}
        iconSize="20px"
        text={
          isDropdownStyle ? <FormattedMessage {...messages.email} /> : undefined
        }
        textColor={colors.grey}
        textHoverColor={isDropdownStyle ? colors.grey : '#fff'}
        iconHoverColor={isDropdownStyle ? colors.grey : '#fff'}
        justify={isDropdownStyle ? 'left' : 'center'}
        bgHoverColor={
          isDropdownStyle ? darken(0.06, '#fff') : darken(0.06, theme.colorMain)
        }
      />
    </Box>
  );
};

export default injectIntl(Email);
