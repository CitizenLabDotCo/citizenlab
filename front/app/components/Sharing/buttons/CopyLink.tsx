import React, { useState } from 'react';

import { Button, Box, fontSizes } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  copyLink: string;
}

const CopyLink = ({ copyLink }: Props) => {
  const { formatMessage } = useIntl();
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
        buttonStyle="primary-outlined"
        minWidth="154px"
        height="40px"
        onClick={handleClick()}
        aria-label={formatMessage(messages.shareByLink)}
        icon="link"
        iconSize="20px"
        fontSize={`${fontSizes.s}px`}
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

export default CopyLink;
