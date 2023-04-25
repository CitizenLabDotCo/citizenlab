import React from 'react';

// components
import { Icon, Box, Text } from '@citizenlab/cl2-component-library';
import { Popup } from 'semantic-ui-react';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// style
import { colors } from 'utils/styleUtils';
import { ItemMenu, StyledBox } from './styles';

export const SupportMenu = () => {
  const { formatMessage } = useIntl();

  return (
    <Popup
      trigger={
        <StyledBox
          as="button"
          width="100%"
          display="flex"
          justifyContent="flex-start"
        >
          <Box display="flex" alignItems="center">
            <Box
              display="flex"
              flex="0 0 auto"
              w="45px"
              h="45px"
              alignItems="center"
              justifyContent="center"
            >
              <Icon name="question-circle" fill={colors.green400} />
            </Box>
            <Box
              display="flex"
              flex="1"
              flexDirection="column"
              opacity={0.7}
              ml="10px"
            >
              <Text color="white" my="0px" fontSize="base">
                {formatMessage({ ...messages.support })}
              </Text>
            </Box>
          </Box>
        </StyledBox>
      }
      on="click"
      position="right center"
      positionFixed
      offset={[0, -40]}
      basic
      wide
    >
      <Box width="224px">
        <ItemMenu
          linkTo={formatMessage(messages.linkToGuide)}
          buttonStyle="text"
          openLinkInNewTab
        >
          <Box display="flex" justifyContent="space-between" width="100%">
            {formatMessage({ ...messages.knowledgeBase })}
            <Icon name="sidebar-guide" />
          </Box>
        </ItemMenu>
        <ItemMenu
          linkTo={formatMessage(messages.linkToAcademy)}
          buttonStyle="text"
          openLinkInNewTab
        >
          <Box display="flex" justifyContent="space-between" w="100%">
            {formatMessage({ ...messages.academy })}
            <Icon name="sidebar-academy" />
          </Box>
        </ItemMenu>
        <ItemMenu
          linkTo={formatMessage(messages.linkToCommunityPlatform)}
          buttonStyle="text"
          openLinkInNewTab
        >
          <Box display="flex" justifyContent="space-between" w="100%">
            {formatMessage({ ...messages.communityPlatform })}
          </Box>
        </ItemMenu>
      </Box>
    </Popup>
  );
};
