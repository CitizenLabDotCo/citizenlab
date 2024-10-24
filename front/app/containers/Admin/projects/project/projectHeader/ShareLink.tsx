import React, { useState } from 'react';

import {
  Button,
  Dropdown,
  Box,
  colors,
  Text,
  Icon,
} from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import Divider from 'components/admin/Divider';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const ShareLink = ({ projectSlug }: { projectSlug: string }) => {
  const { data: appConfiguration } = useAppConfiguration();
  const [shareDropdownIsOpen, setShareDropdownIsOpen] = useState(false);
  const [linkIsCopied, setLinkIsCopied] = useState(false);

  const token = '0123456789'; // TODO: get token from API

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${appConfiguration?.data.attributes.host}/projects/${projectSlug}/preview/${token}`
    );
    setLinkIsCopied(true);
  };

  const { formatMessage } = useIntl();
  return (
    <Box position="relative">
      <Button
        buttonStyle="admin-dark"
        icon="share"
        size="s"
        padding="4px 8px"
        onClick={() => {
          setShareDropdownIsOpen(!shareDropdownIsOpen);
          setLinkIsCopied(false);
        }}
      >
        {formatMessage(messages.share)}
      </Button>
      <Dropdown
        width="600px"
        mobileWidth="300px"
        zIndex="100000"
        top="40px"
        right="0px"
        opened={shareDropdownIsOpen}
        onClickOutside={() => {
          setShareDropdownIsOpen(false);
          setLinkIsCopied(false);
        }}
        content={
          <Box p="8px">
            <Box display="flex" justifyContent="space-between">
              <Text variant="bodyL" my="8px">
                {formatMessage(messages.shareTitle)}
              </Text>
              <Button
                buttonStyle="text"
                padding="8px 16px"
                icon={linkIsCopied ? 'check-circle' : 'link'}
                iconColor={linkIsCopied ? colors.success : colors.teal500}
                textColor={colors.teal500}
                size="s"
                onClick={handleCopyLink}
              >
                {linkIsCopied
                  ? formatMessage(messages.shareLinkCopied)
                  : formatMessage(messages.shareLink)}
              </Button>
            </Box>
            <Divider />
            <Text variant="bodyL" fontSize="m">
              {formatMessage(messages.shareWhoHasAccess)}
            </Text>
            <Text color="textSecondary">
              <Icon name="link" fill={colors.textSecondary} mr="8px" />
              {formatMessage(messages.anyoneWithLink)}
            </Text>
          </Box>
        }
      />
    </Box>
  );
};

export default ShareLink;
