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
  height: 1px;
  background: transparent;
  border-bottom: solid 1px #ccc;
  margin-top: 30px;
  margin-bottom: 20px;
`;

const FooterContent = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const FooterLink = styled.span`
  color: ${(props) => props.theme.colorMain};
  font-size: 16px;
  line-height: 20px;
  font-weight: 400;

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
        <Separator />

        <FooterContent>
          <FooterLink onClick={this.handleOnClick}>{formatMessage(messages.alreadyHaveAnAccount)}</FooterLink>
        </FooterContent>
      </Container>
    );
  }
}

export default injectIntl<Props>(Footer);
