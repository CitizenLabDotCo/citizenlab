import React, { useState } from 'react';
import { WrappedComponentProps } from 'react-intl';
import { Button, Box } from '@citizenlab/cl2-component-library';
// i18n
import { injectIntl } from 'utils/cl-intl';
// style
import { colors } from 'utils/styleUtils';
import messages from '../messages';

interface Props {
  copyLink: string;
}

const CopyLink = ({
  copyLink,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
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
        iconColor={colors.grey700}
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
