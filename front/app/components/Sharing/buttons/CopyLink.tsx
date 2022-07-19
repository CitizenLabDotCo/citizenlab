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

  let setFullWidth = false;

  if (
    formatMessage(messages.linkCopied).length > 15 ||
    formatMessage(messages.shareByLink).length > 15
  ) {
    setFullWidth = true;
  }

  return (
    <Box display="flex" flexGrow={setFullWidth ? 1 : 0}>
      <Button
        buttonStyle="secondary"
        minWidth="154px"
        width="100%"
        onClick={handleClick()}
        aria-label={formatMessage(messages.shareByLink)}
        icon="link"
        iconColor={colors.grey}
        iconSize="20px"
        fontSize="14px"
        text={
          linkIsCopied
            ? formatMessage(messages.linkCopied)
            : formatMessage(messages.shareByLink)
        }
        paddingX="4px"
      />
    </Box>
  );
};

export default injectIntl(CopyLink);
