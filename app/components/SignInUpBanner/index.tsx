import React from 'react';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 50px;
  padding-top: 58px;
  padding-left: 70px;
  position: relative;
  background: #fff;
`;

const Slogan = styled.div`
  width: 100%;
  max-width: 400px;
  color: ${props => props.theme.colorMain || '#333'};
  font-size: 34px;
  line-height: 44px;
  font-weight: 600;
  position: sticky;
  top: 140px;
`;

type Props = {};

type State = {};

export default class SignInUpBanner extends React.PureComponent<Props, State> {
  render() {
    return (
      <Container>
        <Slogan><FormattedMessage {...messages.slogan} /></Slogan>
      </Container>
    );
  }
}
