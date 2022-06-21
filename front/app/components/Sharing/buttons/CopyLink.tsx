import React, { useState } from 'react';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';
import { Button, Box } from '@citizenlab/cl2-component-library';

// style
import { colors } from 'utils/styleUtils';
import { darken } from 'polished';
interface Props {
  isDropdownStyle: boolean;
  copyLink: string;
}

const CopyLink = ({
  isDropdownStyle,
  copyLink,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const [linkIsCopied, setLinkCopied] = useState(false);

  const handleClick = () => () => {
    navigator.clipboard.writeText(copyLink);
    setLinkCopied(true);
  };

  return (
    <Box flex="1 1 1" display="flex" style={{ cursor: 'pointer' }}>
      <Button
        onClick={handleClick()}
        aria-label={formatMessage(messages.shareByLink)}
        bgColor={isDropdownStyle ? '#fff' : colors.backgroundLightGrey}
        width="100%"
        icon="link"
        iconColor={colors.grey}
        iconSize="20px"
        text={
          linkIsCopied ? (
            <FormattedMessage {...messages.linkCopied} />
          ) : (
            <FormattedMessage {...messages.shareByLink} />
          )
        }
        textColor={colors.grey}
        textHoverColor={colors.grey}
        iconHoverColor={colors.grey}
        justify={isDropdownStyle ? 'left' : 'center'}
        bgHoverColor={
          isDropdownStyle
            ? darken(0.06, '#fff')
            : darken(0.06, colors.backgroundLightGrey)
        }
      />
    </Box>
  );
};

export default injectIntl(CopyLink);
