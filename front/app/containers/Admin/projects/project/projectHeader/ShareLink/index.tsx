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
  Divider,
} from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useRefreshProjectPreviewToken from 'api/projects/useRefreshProjectPreviewToken';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import RegenerateLinkModal from './RegenerateLinkModal';
import tracks from './tracks';

interface Props {
  projectId: string;
  projectSlug: string;
  token: string;
  className?: string;
}

const ShareLink = ({ projectId, projectSlug, token, className }: Props) => {
  const [refreshModalIsOpen, setRefreshModalIsOpen] = useState(false);
  const isPreviewLinkEnabled = useFeatureFlag({ name: 'project_preview_link' });
  const { data: appConfiguration } = useAppConfiguration();
  const { mutate: refreshProjectPreviewToken, isLoading } =
    useRefreshProjectPreviewToken();
  const [shareDropdownIsOpen, setShareDropdownIsOpen] = useState(false);
  const [linkIsCopied, setLinkIsCopied] = useState(false);

  const link = `projects/${projectSlug}/preview/${token}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `https://${appConfiguration?.data.attributes.host}/${link}`
    );
    setLinkIsCopied(true);
    trackEventByName(tracks.copyProjectPreviewLink);
  };

  const { formatMessage } = useIntl();

  const refreshLink = () => {
    refreshProjectPreviewToken(
      { projectId },
      {
        onSuccess: () => {
          setLinkIsCopied(false);
          setRefreshModalIsOpen(false);
          trackEventByName(tracks.regenerateProjectPreviewLink);
        },
      }
    );
  };
  return (
    <Box position="relative" className={className}>
      <Button
        id="e2e-share-link"
        buttonStyle="admin-dark"
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
          setLinkIsCopied(false);
          setShareDropdownIsOpen(false);
        }}
        content={
          <Box p="8px">
            <Box display="flex" justifyContent="space-between">
              <Text variant="bodyL" my="8px">
                {formatMessage(messages.shareTitle)}
              </Text>
              <Box display="flex" alignItems="center">
                <Tooltip
                  content={
                    isPreviewLinkEnabled
                      ? ''
                      : formatMessage(messages.shareLinkUpsellTooltip)
                  }
                  disabled={isPreviewLinkEnabled}
                >
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
                    disabled={!isPreviewLinkEnabled}
                  >
                    {linkIsCopied
                      ? formatMessage(messages.shareLinkCopied)
                      : formatMessage(messages.shareLink)}
                  </Button>
                </Tooltip>

                {isPreviewLinkEnabled && (
                  <Box display="none" id="e2e-link">
                    {link}
                  </Box>
                )}

                <Tooltip
                  content={formatMessage(messages.refreshLinkTooltip)}
                  placement="bottom"
                >
                  <IconButton
                    id="e2e-refresh-link"
                    iconWidth="28px"
                    iconHeight="28px"
                    iconName="refresh"
                    onClick={() => setRefreshModalIsOpen(true)}
                    a11y_buttonActionMessage={formatMessage(
                      messages.refreshLink
                    )}
                    iconColor={colors.teal500}
                    iconColorOnHover={colors.teal700}
                    p="0px"
                    disabled={!isPreviewLinkEnabled}
                  />
                </Tooltip>
              </Box>
            </Box>
            <RegenerateLinkModal
              isOpened={refreshModalIsOpen}
              onRefresh={refreshLink}
              isRefreshLoading={isLoading}
              onClose={() => setRefreshModalIsOpen(false)}
            />

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
