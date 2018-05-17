import React from 'react';

// context
import { PreviousPathnameContext } from 'context';

// router
import { browserHistory } from 'react-router';

// components
import SignIn from 'components/SignIn';
import SignInUpBanner from 'components/SignInUpBanner';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  background: #f9f9fa;
  position: relative;

  ${media.biggerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  `}

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
  `}
`;

const Section = styled.div`
  flex: 1;
  height: 100%;
`;

const Left = Section.extend`
  width: 50vw;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  display: none;

  ${media.biggerThanMaxTablet`
    display: block;
  `}
`;

const Right = Section.extend`
  width: 100%;

  ${media.biggerThanMaxTablet`
    padding-left: 50vw;
  `}
`;

const RightInner = styled.div`
  width: 100%;
  max-width: 420px;
  margin-left: auto;
  margin-right: auto;
  padding-top: 60px;
  padding-bottom: 60px;
  padding-left: 30px;
  padding-right: 30px;
`;

type Props = {};

type State = {};

class SignInPage extends React.PureComponent<Props, State> {
  onSuccess = (previousPathname: string | null) => () => {
    browserHistory.push(previousPathname || '/');
  }

  goToSignUpForm = () => {
    browserHistory.push('/sign-up');
  }

  render() {
    return (
      <Container>
        <Left>
          <SignInUpBanner />
        </Left>
        <Right>
          <RightInner>
            <PreviousPathnameContext.Consumer>
              {previousPathName => <SignIn onSignedIn={this.onSuccess(previousPathName)} goToSignUpForm={this.goToSignUpForm} />}
            </PreviousPathnameContext.Consumer>
          </RightInner>
        </Right>
      </Container>
    );
  }
}

export default SignInPage;
