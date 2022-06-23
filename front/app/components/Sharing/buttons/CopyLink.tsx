import React, { useState } from 'react';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';
import { Button, Box } from '@citizenlab/cl2-component-library';

// style
import { colors } from 'utils/styleUtils';
interface Props {
  copyLink: string;
}

const CopyLink = ({
  copyLink,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const [linkIsCopied, setLinkCopied] = useState(false);

  const handleClick = () => () => {
    navigator.clipboard.writeText(copyLink);
    setLinkCopied(true);
  };

  return (
    <Box flex="1 1 1" display="flex">
      <Button
        onClick={handleClick()}
        aria-label={formatMessage(messages.shareByLink)}
        bgColor={colors.backgroundLightGrey}
        icon="link"
        iconColor={colors.grey}
        iconSize="20px"
        text={
          linkIsCopied
            ? formatMessage(messages.linkCopied)
            : formatMessage(messages.shareByLink)
        }
        textColor={colors.grey}
        textHoverColor={colors.grey}
        iconHoverColor={colors.grey}
      />
    </Box>
  );
};

export default injectIntl(CopyLink);
