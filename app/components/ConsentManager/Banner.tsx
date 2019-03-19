import React, { PureComponent } from 'react';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import ContentContainer from 'components/ContentContainer';
import Link from 'utils/cl-router/Link';
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';
import styled from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';
import { rgba } from 'polished';

const Container = styled.div`
  position: fixed;
  bottom: 0;
  color: white;
  background: ${colors.adminTextColor};
  font-size: ${fontSizes.base};
  z-index: 10;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 30px;

  ${media.smallerThanMaxTablet`
    bottom: ${(props) => props.theme.mobileMenuHeight}px;
  `}

  ${media.smallerThanMinTablet`
    padding-left: 15px;
    padding-right: 15px;
    padding-top: 20px;
    padding-bottom: 20px;
  `}
`;

const ContentContainerInner = styled.div`
  display: flex;
  align-items: center;

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

  ${media.smallerThanMinTablet`
    max-width: auto;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
  `}
`;

const Left = styled.div`
  flex: 1;
  margin-right: 40px;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  ${media.smallerThanMinTablet`
    margin-right: 0px;
    margin-bottom: 20px;
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
`;

const PreferencesButton = styled(Button)`
  margin-right: 10px;

  ${media.smallerThanMinTablet`
    margin-right: 0px;
    order: 2;
  `}
`;

const AcceptButton = styled(Button)`
  ${media.smallerThanMinTablet`
    margin-right: 10px;
    order: 1;
  `}
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
  render() {
    const {
      onAccept,
      onChangePreferences,
      intl: { formatMessage }
    } = this.props;

    return (
      <Container role="banner">
        <ContentContainer mode="page">
        <ContentContainerInner>
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
            <PreferencesButton
              borderColor="transparent"
              textColor="#fff"
              bgColor={colors.adminTextColor}
              bgHoverColor={rgba(255, 255, 255, 0.15)}
              padding="8px 12px"
              onClick={onChangePreferences}
              className="integration-open-modal"
            >
              <FormattedMessage {...messages.manage} />
            </PreferencesButton>
            <AcceptButton
              className="e2e-accept-cookies-btn"
              style="primary-inverse"
              textColor={colors.adminTextColor}
              padding="8px 12px"
              onClick={onAccept}
            >
              <FormattedMessage {...messages.accept} />
            </AcceptButton>
          </ButtonContainer>
        </ContentContainerInner>
        </ContentContainer>

        <CloseButton
          type="button"
          className="integration-button-close"
          title={formatMessage(messages.ariaButtonClose)}
          aria-label={formatMessage(messages.ariaButtonClose)}
          onClick={onAccept}
        >
          <Icon name="close4" />
        </CloseButton>
      </Container>
    );
  }
}

export default injectIntl(Banner);
