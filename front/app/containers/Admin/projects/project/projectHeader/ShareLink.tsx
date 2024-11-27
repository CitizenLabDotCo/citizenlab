import React, { useState } from 'react';

import {
  Button,
  Dropdown,
  Box,
  colors,
  Text,
  Icon,
  IconButton,
  Tooltip,
  Spinner,
} from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useRefreshProjectPreviewToken from 'api/projects/useRefreshProjectPreviewToken';

import Divider from 'components/admin/Divider';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const ShareLink = ({
  projectId,
  projectSlug,
  token,
}: {
  projectId: string;
  projectSlug: string;
  token: string;
}) => {
  const { data: appConfiguration } = useAppConfiguration();
  const { mutate: refreshProjectPreviewToken, isLoading } =
    useRefreshProjectPreviewToken();
  const [shareDropdownIsOpen, setShareDropdownIsOpen] = useState(false);
  const [linkIsCopied, setLinkIsCopied] = useState(false);

  const link = `projects/${projectSlug}/preview/${token}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${appConfiguration?.data.attributes.host}/${link}`
    );
    setLinkIsCopied(true);
  };

  const { formatMessage } = useIntl();

  const refreshLink = () => {
    refreshProjectPreviewToken(
      { projectId },
      {
        onSuccess: () => {
          setLinkIsCopied(false);
        },
      }
    );
  };
  return (
    <Box position="relative">
      <Button
        id="e2e-share-link"
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
              <Box display="flex" alignItems="center">
                <Button
                  id="e2e-copy-link"
                  buttonStyle="text"
                  padding="8px"
                  icon={linkIsCopied ? 'check-circle' : 'link'}
                  iconColor={linkIsCopied ? colors.success : colors.teal500}
                  iconHoverColor={
                    linkIsCopied ? colors.success : colors.teal700
                  }
                  textColor={colors.teal500}
                  textHoverColor={colors.teal700}
                  size="s"
                  onClick={handleCopyLink}
                >
                  {linkIsCopied
                    ? formatMessage(messages.shareLinkCopied)
                    : formatMessage(messages.shareLink)}
                </Button>
                <Box display="none" id="e2e-link">
                  {link}
                </Box>
                {isLoading ? (
                  <Spinner size="20px" />
                ) : (
                  <Tooltip content={formatMessage(messages.refreshLinkTooltip)}>
                    <IconButton
                      id="e2e-refresh-link"
                      iconWidth="28px"
                      iconHeight="28px"
                      iconName="refresh"
                      onClick={refreshLink}
                      a11y_buttonActionMessage={formatMessage(
                        messages.refreshLink
                      )}
                      iconColor={colors.teal500}
                      iconColorOnHover={colors.teal700}
                      p="0px"
                    />
                  </Tooltip>
                )}
              </Box>
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
