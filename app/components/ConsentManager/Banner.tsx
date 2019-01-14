import React, { PureComponent } from 'react';

import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

import Link from 'utils/cl-router/Link';
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';

import styled from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';

const Root = styled.div`
  position: fixed;
  bottom: 0;
  color: white;
  background: ${colors.adminTextColor};
  font-size: ${fontSizes.base};
  z-index: 10;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 30px;
  ${media.smallerThanMaxTablet`
    bottom: ${(props) => props.theme.mobileMenuHeight}px;
  `}
  ${media.smallerThanMinTablet`
    padding: 10px 15px;
  `}
`;

const Spacer = styled.div`
  flex: 1;
`;

const StyledContentContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding-right: 35px;
  padding-left: 35px;
  max-width: ${(props) => props.theme.maxPageWidth}px;
  p:first-child {
    font-weight: 700;
    margin-bottom: 5px;
  }
  ${media.smallerThanMaxTablet`
    flex-wrap: wrap;
    justify-content: flex-end;
    padding: 0px;
    p:last-child {
      display: none;
    }
    p:fist-child {
      margin: 5px;
    }
  `}
`;

const StyledLink = styled(Link)`
  color: white;
  text-decoration: underline;
  &:hover, &:focus {
    color: white;
    text-decoration: underline;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  button {
    margin: 4px;
  }
  button.primary-inverse span {
    color: ${colors.adminTextColor};
  }
`;

const CloseButton = styled.button`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  fill: white;
  cursor: pointer;
  svg {
    height: 15px;
  }
  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

interface Props {
  onAccept: () => void;
  onChangePreferences: () => void;
}

class Banner extends PureComponent<Props & InjectedIntlProps> {
  static displayName = 'Banner';

  render() {
    const {
      onAccept,
      onChangePreferences,
      intl: { formatMessage }
    } = this.props;

    return (
      <Root role="banner">
        <StyledContentContainer>
          <div>
            <FormattedMessage
              tagName="p"
              {...messages.mainText}
              values={{
                // tslint:disable-next-line
                policyLink: (
                  <StyledLink to="/pages/cookie-policy" target="_blank">
                    <FormattedMessage {...messages.policyLink} />
                  </StyledLink>)
              }}
            />
            <FormattedMessage {...messages.subText} tagName="p" />
          </div>
          <Spacer />
          <ButtonContainer>
            <Button style="admin-dark" className="integration-open-modal" onClick={onChangePreferences}><FormattedMessage {...messages.manage} /></Button>
            <Button className="e2e-accept-cookies-btn" textColor={colors.adminTextColor} style="primary-inverse" onClick={onAccept}><FormattedMessage {...messages.accept} /></Button>
          </ButtonContainer>
        </StyledContentContainer>

        <CloseButton
          type="button"
          className="integration-button-close"
          title={formatMessage(messages.ariaButtonClose)}
          aria-label={formatMessage(messages.ariaButtonClose)}
          onClick={onAccept}
        >
          <Icon name="close4" />
        </CloseButton>
      </Root>
    );
  }
}

export default injectIntl(Banner);
