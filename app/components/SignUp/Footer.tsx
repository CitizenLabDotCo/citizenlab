import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// i18n
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import messages from './messages';

// style
import { darken } from 'polished';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
`;

const Separator = styled.div`
  width: 100%;
  height: 30px;
  display: flex;
  align-items: center;
  position: relative;
  margin-top: 20px;
  margin-bottom: 10px;
`;

const SeparatorLine = styled.div`
  width: 100%;
  height: 1px;
  background: transparent;
  border-bottom: solid 1px #ccc;
`;

const SeparatorTextContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`;

const SeparatorText = styled.div`
  width: 54px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;

  span {
    color: #999;
    font-size: 17px;
  }
`;

const FooterContent = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const FooterText = styled.div`
  color: #888;
  font-size: 17px;
  line-height: 21px;
  font-weight: 400;
  margin-top: 0px;
  margin-bottom: 0px;

  span {
    margin-right: 5px;
  }
`;

const FooterLink = styled.span`
  color: ${(props) => props.theme.colorMain};

  &:hover {
    color: ${(props) => darken(0.15, props.theme.colorMain)};
    cursor: pointer;
  }
`;

type Props = {
  goToSignIn: () => void;
};

type State = {};

class Footer extends React.PureComponent<Props & InjectedIntlProps, State> {
  handleOnClick = () => {
    this.props.goToSignIn();
  }

  render() {
    const { formatMessage } = this.props.intl;

    return (
      <Container>
        <Separator>
          <SeparatorLine />
          <SeparatorTextContainer>
            <SeparatorText>
              <span><FormattedMessage {...messages.or} /></span>
            </SeparatorText>
          </SeparatorTextContainer>
        </Separator>

        <FooterContent>
          <FooterText>
            <span>{formatMessage(messages.alreadyHaveAnAccount)}</span>
            <FooterLink onClick={this.handleOnClick}>{formatMessage(messages.logIn)}</FooterLink>
          </FooterText>
        </FooterContent>
      </Container>
    );
  }
}

export default injectIntl<Props>(Footer);
