import React from 'react';

// styling
import styled from 'styled-components';
import {
  media,
  fontSizes,
  colors,
  isRtl,
} from '@citizenlab/cl2-component-library';
import { rgba } from 'polished';

// components
import ContentContainer from 'components/ContentContainer';
import Link from 'utils/cl-router/Link';
import Button from 'components/UI/Button';
import CloseIconButton from 'components/UI/CloseIconButton';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const Container = styled.div`
  position: fixed;
  bottom: 0px;
  color: white;
  background: ${colors.primary};
  font-size: ${fontSizes.base}px;
  z-index: 1001;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 20px;
  padding-bottom: 20px;
`;

const ContentContainerInner = styled.div`
  display: flex;
  align-items: center;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${media.phone`
    max-width: auto;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
  `}
`;

const Left = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-right: 40px;

  ${media.phone`
    margin-right: 0px;
    margin-bottom: 20px;
  `}

  ${isRtl`
    margin-right: 0;
    margin-left: 40px;

    ${media.phone`
        margin-left: 0px;
    `}
  `}
`;

const Line = styled.div`
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  &.first {
    margin-bottom: 4px;
  }

  ${media.phone`
    &.second {
      display: none;
    }
  `}
`;

const StyledLink = styled(Link)`
  color: white;
  text-decoration: underline;

  &:hover,
  &:focus {
    color: white;
    text-decoration: underline;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const StyledCloseIconButton = styled(CloseIconButton)`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
`;

interface Props {
  onAccept: () => void;
  onChangePreferences: () => void;
  onClose: () => void;
}

const Banner = ({ onAccept, onChangePreferences, onClose }: Props) => {
  return (
    <Container tabIndex={0} role="dialog" id="e2e-cookie-banner">
      <ContentContainer mode="page">
        <ContentContainerInner>
          <Left>
            <Line className="first">
              <FormattedMessage
                {...messages.mainText}
                values={{
                  policyLink: (
                    <StyledLink to="/pages/cookie-policy">
                      <FormattedMessage {...messages.policyLink} />
                    </StyledLink>
                  ),
                }}
              />
            </Line>
            <Line className="second">
              <FormattedMessage {...messages.subText} />
            </Line>
          </Left>
          <ButtonContainer>
            <Button
              className="e2e-accept-cookies-btn"
              buttonStyle="primary-inverse"
              textColor={colors.primary}
              textHoverColor={colors.primary}
              onClick={onAccept}
            >
              <FormattedMessage {...messages.accept} />
            </Button>
            <Button
              buttonStyle="primary-inverse"
              textColor={colors.primary}
              textHoverColor={colors.primary}
              onClick={onClose}
            >
              <FormattedMessage {...messages.reject} />
            </Button>
            <Button
              className="integration-open-modal"
              padding="0px"
              buttonStyle="text"
              textColor={colors.white}
              textHoverColor={colors.white}
              onClick={onChangePreferences}
            >
              <FormattedMessage {...messages.manage} />
            </Button>
          </ButtonContainer>
        </ContentContainerInner>
      </ContentContainer>
      <StyledCloseIconButton
        className="e2e-close-cookie-banner"
        a11y_buttonActionMessage={messages.ariaButtonClose}
        onClick={onClose}
        iconColor={rgba(255, 255, 255, 0.7)}
        iconColorOnHover={'#fff'}
      />
    </Container>
  );
};

export default Banner;
