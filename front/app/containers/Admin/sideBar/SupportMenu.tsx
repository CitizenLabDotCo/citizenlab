import React from 'react';
import { rgba } from 'polished';

// components
import { Icon, Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { Popup } from 'semantic-ui-react';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const ItemMenu = styled(Button)`
  color: ${colors.coolGrey600};
  display: flex;
  align-items: center;
  width: 100%;
  &:hover {
    color: ${colors.coolGrey600};
    background: ${rgba(colors.teal400, 0.07)};
  }
  span {
    width: 100%;
  }
`;

const StyledBox = styled(Box)`
  cursor: pointer;
  &:hover {
    background: rgba(0, 0, 0, 0.36);
  }
`;

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
