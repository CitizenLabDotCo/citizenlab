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
    padding: 15px 15px;
  `}
`;

const StyledContentContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  width: 100%;
  padding-right: 35px;
  padding-left: 35px;
  max-width: ${(props) => props.theme.maxPageWidth}px;

  p:first-child {
    font-weight: 500;
    margin-bottom: 5px;
  }

  ${media.smallerThanMaxTablet`
    padding: 0px;

    p:first-child {
      font-weight: 300;
      margin: 0;
    }

    p:last-child {
      display: none;
    }
  `}
`;

const Left = styled.div`
  flex: 1;
  margin-right: 40px;

  ${media.smallerThanMinTablet`
    margin-right: 20px;
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
    width: 15px;
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
          <Left>
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
          </Left>
          <ButtonContainer>
            <Button
              style="primary-outlined"
              borderColor="transparent"
              textColor="#fff"
              onClick={onChangePreferences}
            >
              <FormattedMessage {...messages.manage} />
            </Button>
            <Button
              className="e2e-accept-cookies-btn"
              style="primary-inverse"
              textColor={colors.adminTextColor}
              onClick={onAccept}
            >
              <FormattedMessage {...messages.accept} />
            </Button>
          </ButtonContainer>
        </StyledContentContainer>

        <CloseButton
          type="button"
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
