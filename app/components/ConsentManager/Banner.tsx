import React, { PureComponent } from 'react';

import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';

import Link from 'utils/cl-router/Link';
import Button from 'components/UI/Button';
import ContentContainer from 'components/ContentContainer';

import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Root = styled.div`
  position: fixed;
  bottom: 0;
  color: white;
  background: ${(props) => props.theme.colorMain};
  font-size: 16px;
  line-height: 1.3;
  z-index: 10;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 30px;
`;

const Spacer = styled.div`
  flex: 1;
`;
const StyledContentContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: ${(props) => props.theme.maxPageWidth}px;
  Button.button.primary {
    border-color: white;
    margin-right: 10px;
  }
`;
const Content = styled.div`
  a {
    display: inline;
    padding: 0;
    border: none;
    background: none;
    color: inherit;
    font: inherit;
    text-decoration: underline;
    cursor: pointer;
  }
  p:first-child {
    font-weight: 700;
    margin-bottom: 5px;
  }
`;
const ManageButton = styled(Button)`
  border-color: white;
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
      <Root>
        <StyledContentContainer>
        <Content>
          <FormattedMessage
            tagName="p"
            {...messages.mainText}
            values={{
              // tslint:disable-next-line
              privacyPolicyLink: (
                <Link to="/pages/privacy-policy" target="_blank">
                  <FormattedMessage {...messages.privacyPolicy} />
                </Link>)
            }}
          />
          <FormattedMessage {...messages.subText} tagName="p" />
        </Content>
        <Spacer/>
        <Button style="primary" onClick={onChangePreferences}><FormattedMessage {...messages.manage} /></Button>
        <Button style="primary-inverse" onClick={onAccept}><FormattedMessage {...messages.accept} /></Button>
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
