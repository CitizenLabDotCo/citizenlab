import React from 'react';
import { rgba } from 'polished';

// components
import { Icon, Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { Popup } from 'semantic-ui-react';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';

const StyledButton = styled(Button)`
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

const IconWrapper = styled.div`
  flex: 0 0 auto;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledBox = styled(Box)`
  cursor: pointer;
  &:hover {
    background: rgba(0, 0, 0, 0.36);
  }
`;

const CustomText = styled.div`
  flex: 1;
  color: ${colors.white};
  opacity: 0.7;

  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 19px;
  margin-left: 10px;

  ${media.phone`
    display: none;
  `}
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
          mb="25px"
        >
          <Box display="flex" alignItems="center">
            <IconWrapper>
              <Icon name="question-circle" fill={colors.green400} />
            </IconWrapper>
            <CustomText>{formatMessage({ ...messages.support })}</CustomText>
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
      <StyledButton
        linkTo={formatMessage(messages.linkToGuide)}
        buttonStyle="text"
        openLinkInNewTab
      >
        <Box display="flex" justifyContent="space-between" width="100%">
          {formatMessage({ ...messages.knowledgeBase })}
          <Icon name="sidebar-guide" />
        </Box>
      </StyledButton>
      <StyledButton
        linkTo={formatMessage(messages.linkToAcademy)}
        buttonStyle="text"
        openLinkInNewTab
      >
        <Box display="flex" justifyContent="space-between" w="100%">
          {formatMessage({ ...messages.academy })}
          <Icon name="sidebar-academy" />
        </Box>
      </StyledButton>
      <StyledButton
        linkTo={formatMessage(messages.linkToCommunityPlatform)}
        buttonStyle="text"
        openLinkInNewTab
      >
        <Box display="flex" justifyContent="space-between" w="100%">
          {formatMessage({ ...messages.communityPlatform })}
        </Box>
      </StyledButton>
    </Popup>
  );
};
