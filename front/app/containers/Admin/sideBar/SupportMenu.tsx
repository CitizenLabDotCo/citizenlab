import React, { useState } from 'react';

import {
  Icon,
  Box,
  Text,
  colors,
  Dropdown,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';

import { useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import messages from './messages';
import RailTooltip from './RailTooltip';
import { ItemMenu, StyledBox, StyledText } from './styles';
import useSidebarCollapsed from './useSidebarCollapsed';

const StyledIcon = styled(Icon)`
  flex-shrink: 0;
  margin-top: auto;
  margin-bottom: auto;
`;

export const SupportMenu = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { formatMessage } = useIntl();
  const collapsed = useSidebarCollapsed();
  const { data: authUser } = useAuthUser();
  const { data: tenant } = useAppConfiguration();

  const customerPortalUrl =
    tenant?.data.attributes.settings.core.customer_portal_url;

  return (
    <RailTooltip label={formatMessage(messages.support)} disabled={!collapsed}>
      <StyledBox
        as="button"
        width={collapsed ? '56px' : '100%'}
        display="flex"
        justifyContent="flex-start"
        p="0px"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        position="relative"
      >
        <Box
          display="flex"
          alignItems="center"
          w="100%"
          p={collapsed ? '10px 0' : '10px 8px 10px 16px'}
          justifyContent={collapsed ? 'center' : undefined}
        >
          <Box
            display="flex"
            flex="0 0 auto"
            alignItems="center"
            justifyContent="center"
          >
            <Icon name="help" fill={colors.green400} height="20px" />
          </Box>
          {!collapsed && (
            <StyledText
              color="white"
              ml="15px"
              fontSize="base"
              textAlign="left"
              my="0px"
              w="100%"
            >
              {formatMessage({ ...messages.support })}
            </StyledText>
          )}
          <Box>
            {!collapsed && <Icon name="chevron-right" fill={colors.white} />}
          </Box>
        </Box>
        <Dropdown
          opened={isDropdownOpen}
          onClickOutside={() => setIsDropdownOpen(false)}
          left={collapsed ? '60px' : '200px'}
          mobileLeft="60px"
          top="-140px"
          content={
            <Box>
              <ItemMenu
                linkTo={formatMessage(messages.linkToSupport)}
                buttonStyle="text"
                openLinkInNewTab
              >
                <Box display="flex" justifyContent="space-between" width="100%">
                  <Text my="0px" color="coolGrey600">
                    {formatMessage({ ...messages.knowledgeBase })}
                  </Text>
                  <StyledIcon name="book" fill={colors.grey600} />
                </Box>
              </ItemMenu>
              <ItemMenu
                linkTo={formatMessage(messages.linkToChangelog2)}
                buttonStyle="text"
                openLinkInNewTab
              >
                <Box display="flex" justifyContent="space-between" width="100%">
                  <Text my="0px" color="coolGrey600">
                    {formatMessage({ ...messages.productChangelog })}
                  </Text>
                  <StyledIcon name="survey-long-answer" fill={colors.grey600} />
                </Box>
              </ItemMenu>
              <ItemMenu
                linkTo={
                  formatMessage(messages.linkToCommunityPlatform) as string
                }
                buttonStyle="text"
                openLinkInNewTab
              >
                <Box display="flex" justifyContent="space-between" w="100%">
                  <Text my="0px" color="coolGrey600">
                    {formatMessage({ ...messages.communityPlatform })}
                  </Text>
                  <StyledIcon name="community" fill={colors.grey600} />
                </Box>
              </ItemMenu>

              {customerPortalUrl && isAdmin(authUser) && (
                <ItemMenu
                  linkTo={customerPortalUrl}
                  buttonStyle="text"
                  openLinkInNewTab
                >
                  <Box display="flex" justifyContent="space-between" w="100%">
                    <Text my="0px" color="coolGrey600">
                      {formatMessage({ ...messages.customerPortal })}
                    </Text>
                    <Icon name="users" fill={colors.grey600} />
                  </Box>
                </ItemMenu>
              )}
            </Box>
          }
        />
      </StyledBox>
    </RailTooltip>
  );
};
