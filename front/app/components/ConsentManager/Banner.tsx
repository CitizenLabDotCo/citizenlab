import React from 'react';

import {
  media,
  fontSizes,
  colors,
  isRtl,
} from '@citizenlab/cl2-component-library';
import { rgba } from 'polished';
import styled from 'styled-components';

import ContentContainer from 'components/ContentContainer';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import CloseIconButton from 'components/UI/CloseIconButton';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from './messages';

const Container = styled.div`
  position: fixed;
  bottom: 0px;
  color: white;
  background: ${colors.primary};
  font-size: ${fontSizes.base}px;
  z-index: 1100;
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
    <Container
      tabIndex={0}
      role="dialog"
      id="e2e-cookie-banner"
      // aria-labelledby helps screen readers find
      // the title of the dialog
      // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/dialog_role
      aria-labelledby="cookie-banner-title"
    >
      <ContentContainer mode="page">
        <ContentContainerInner>
          <Left id="cookie-banner-title">
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
          </Left>
          <ButtonContainer>
            <ButtonWithLink
              className="e2e-accept-cookies-btn"
              buttonStyle="primary-inverse"
              textColor={colors.primary}
              textHoverColor={colors.primary}
              onClick={onAccept}
            >
              <FormattedMessage {...messages.accept} />
            </ButtonWithLink>
            <ButtonWithLink
              buttonStyle="primary-inverse"
              textColor={colors.primary}
              textHoverColor={colors.primary}
              onClick={onClose}
            >
              <FormattedMessage {...messages.reject} />
            </ButtonWithLink>
            <ButtonWithLink
              className="integration-open-modal"
              padding="0px"
              buttonStyle="text"
              textColor={colors.white}
              textHoverColor={colors.white}
              onClick={onChangePreferences}
            >
              <FormattedMessage {...messages.manage} />
            </ButtonWithLink>
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
