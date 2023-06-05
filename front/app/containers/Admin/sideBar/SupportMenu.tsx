import React, { useRef } from 'react';

// components
import {
  Icon,
  Box,
  Text,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { Popup } from 'semantic-ui-react';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// style
import { colors } from 'utils/styleUtils';
import { ItemMenu, StyledBox, StyleIconBox } from './styles';

export const SupportMenu = () => {
  const { formatMessage } = useIntl();
  const isSmallerThanPhone = useBreakpoint('tablet');
  const iconDivRef = useRef<HTMLDivElement | null>(null);

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
              <>
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
                <Box ref={iconDivRef}>
                  <Icon name="chevron-right" fill={colors.white} />
                </Box>
              </>
            )}
          </Box>
        </StyledBox>
      }
      on="click"
      position="top right"
      context={iconDivRef}
      positionFixed
      offset={[40, -60]}
      basic
      wide
    >
      <Box width="224px">
        <ItemMenu
          linkTo={formatMessage(messages.linkToSupport)}
          buttonStyle="text"
          openLinkInNewTab
        >
          <StyleIconBox
            display="flex"
            justifyContent="space-between"
            width="100%"
          >
            {formatMessage({ ...messages.knowledgeBase })}
            <Icon name="book" />
          </StyleIconBox>
        </ItemMenu>
        <ItemMenu
          linkTo={formatMessage(messages.linkToAcademy)}
          buttonStyle="text"
          openLinkInNewTab
        >
          <StyleIconBox display="flex" justifyContent="space-between" w="100%">
            {formatMessage({ ...messages.academy })}
            <Icon name="academy" />
          </StyleIconBox>
        </ItemMenu>
        <ItemMenu
          linkTo={formatMessage(messages.linkToCommunityPlatform)}
          buttonStyle="text"
          openLinkInNewTab
        >
          <StyleIconBox display="flex" justifyContent="space-between" w="100%">
            {formatMessage({ ...messages.communityPlatform })}
            <Icon name="community" />
          </StyleIconBox>
        </ItemMenu>
      </Box>
    </Popup>
  );
};
