import React, { useRef } from 'react';

import {
  Icon,
  Box,
  Text,
  useBreakpoint,
  colors,
} from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';
import { Popup } from 'semantic-ui-react';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { ItemMenu, StyledBox } from './styles';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { isAdmin } from 'utils/permissions/roles';
import useAuthUser from 'api/me/useAuthUser';

export const SupportMenu = () => {
  const { formatMessage } = useIntl();
  const isSmallerThanPhone = useBreakpoint('tablet');
  const iconDivRef = useRef<HTMLDivElement | null>(null);
  const { data: authUser } = useAuthUser();
  const { data: tenant } = useAppConfiguration();

  const customerPortalUrl =
    tenant?.data.attributes.settings.core.customer_portal_url;

  return (
    <Popup
      trigger={
        <StyledBox
          as="button"
          width={isSmallerThanPhone ? '56px' : '100%'}
          display="flex"
          justifyContent="flex-start"
          p="0px"
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
            <Box ref={iconDivRef}>
              {!isSmallerThanPhone && (
                <Icon name="chevron-right" fill={colors.white} />
              )}
            </Box>
          </Box>
        </StyledBox>
      }
      on="click"
      position="right center"
      context={iconDivRef}
      positionFixed
      offset={[-40, 0]}
      basic
      wide
    >
      <Box width="224px">
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
          linkTo={formatMessage(messages.linkToCommunityPlatform) as RouteType}
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
    </Popup>
  );
};
