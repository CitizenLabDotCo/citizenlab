import React, { useState } from 'react';

import {
  Icon,
  Box,
  Text,
  useBreakpoint,
  colors,
  Dropdown,
} from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';

import { useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import messages from './messages';
import { ItemMenu, StyledBox } from './styles';

export const SupportMenu = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { formatMessage } = useIntl();
  const isSmallerThanPhone = useBreakpoint('tablet');
  const { data: authUser } = useAuthUser();
  const { data: tenant } = useAppConfiguration();

  const customerPortalUrl =
    tenant?.data.attributes.settings.core.customer_portal_url;

  return (
    <StyledBox
      as="button"
      width={isSmallerThanPhone ? '56px' : '100%'}
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
        p={isSmallerThanPhone ? '10px 0' : '10px 8px 10px 16px'}
        justifyContent={isSmallerThanPhone ? 'center' : undefined}
      >
        <Box
          display="flex"
          flex="0 0 auto"
          alignItems="center"
          justifyContent="center"
        >
          <Icon name="help" fill={colors.green400} width="24px" />
        </Box>
        {!isSmallerThanPhone && (
          <Text
            color="white"
            ml="15px"
            fontSize="base"
            textAlign="left"
            my="0px"
            w="100%"
          >
            {formatMessage({ ...messages.support })}
          </Text>
        )}
        <Box>
          {!isSmallerThanPhone && (
            <Icon name="chevron-right" fill={colors.white} />
          )}
        </Box>
      </Box>
      <Dropdown
        opened={isDropdownOpen}
        onClickOutside={() => setIsDropdownOpen(false)}
        left={isSmallerThanPhone ? '60px' : '200px'}
        top="-40px"
        content={
          <Box>
            <ItemMenu
              linkTo={formatMessage(messages.linkToSupport) as RouteType}
              buttonStyle="text"
              openLinkInNewTab
            >
              <Box display="flex" justifyContent="space-between" width="100%">
                <Text my="0px" color="coolGrey600">
                  {formatMessage({ ...messages.knowledgeBase })}
                </Text>
                <Icon name="book" fill={colors.grey600} />
              </Box>
            </ItemMenu>
            <ItemMenu
              linkTo={
                formatMessage(messages.linkToCommunityPlatform) as RouteType
              }
              buttonStyle="text"
              openLinkInNewTab
            >
              <Box display="flex" justifyContent="space-between" w="100%">
                <Text my="0px" color="coolGrey600">
                  {formatMessage({ ...messages.communityPlatform })}
                </Text>
                <Icon name="community" fill={colors.grey600} />
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
  );
};
