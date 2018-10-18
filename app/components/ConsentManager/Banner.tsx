import React, { PureComponent } from 'react';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import Link from 'utils/cl-router/Link';
import Button from 'components/UI/Button';

import styled from 'styled-components';
import { media, fontSizes } from 'utils/styleUtils';

const Root = styled.div`
  position: fixed;
  bottom: 0;
  color: white;
  background: ${(props) => props.theme.colorMain};
  font-size: ${fontSizes.small};
  line-height: 22px;
  z-index: 10;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 30px;
  ${media.smallerThanMaxTablet`
    bottom: ${(props) => props.theme.mobileMenuHeight}px;
  `}
`;

const Spacer = styled.div`
  flex: 1;
`;

const StyledContentContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: ${(props) => props.theme.maxPageWidth}px;
`;

const StyledLink = styled(Link)`
  color: white;
  text-decoration: underline;
  &:hover, &:focus {
    font-weight: 700;
    color: white;
    outline: none;
    text-decoration: underline;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  button {
    margin: 4px;
  }
  Button.button.primary {
    border-color: white;
  }
  ${media.smallerThanMaxTablet`
    flex-wrap: wrap;
  `}
`;

const StyledFormattedMessage = styled(FormattedMessage)`
    font-weight: 700;
    margin-bottom: 5px;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  padding: 8px;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  line-height: 1;
  cursor: pointer;
`;

interface Props {
  onAccept: () => void;
  onChangePreferences: () => void;
}

export default class Banner extends PureComponent<Props> {
  static displayName = 'Banner';

  render() {
    const {
      onAccept,
      onChangePreferences,
    } = this.props;

    return (
      <Root role="banner">
        <StyledContentContainer>
          <div>
            <StyledFormattedMessage
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
            <Button style="primary" onClick={onChangePreferences}><FormattedMessage {...messages.manage} /></Button>
            <Button style="primary-inverse" onClick={onAccept}><FormattedMessage {...messages.accept} /></Button>
          </ButtonContainer>
        </StyledContentContainer>

        <CloseButton
          type="button"
          title="Accept policy"
          aria-label="Accept policy"
          onClick={onAccept}
        >
          ✕
        </CloseButton>
      </Root>
    );
  }
}
