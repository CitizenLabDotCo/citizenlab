import React, { PureComponent } from 'react';

// context
import { PreviousPathnameContext } from 'context';

// router
import clHistory from 'utils/cl-router/history';

// components
import SignIn from 'components/SignIn';
import SignInUpBanner from 'components/SignInUpBanner';

// style
import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  background: ${colors.background};
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

const Left = styled(Section)`
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

const Right = styled(Section)`
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
  padding-left: 20px;
  padding-right: 20px;
`;

export default class SignInPage extends PureComponent {
  onSuccess = (previousPathname: string | null) => () => {
    if (previousPathname && !(previousPathname.endsWith('/sign-up') || previousPathname.endsWith('/sign-in'))) {
      // go back to the page you were previously on after signing in
      clHistory.push(previousPathname);
    } else {
      clHistory.push('/');
    }
  }

  goToSignUpForm = () => {
    clHistory.push('/sign-up');
  }

  render() {
    return (
      <Container className="e2e-sign-in-page">
        <Left>
          <SignInUpBanner />
        </Left>
        <Right>
          <RightInner>
            <PreviousPathnameContext.Consumer>
              {previousPathName => <SignIn onSignedIn={this.onSuccess(previousPathName)} />}
            </PreviousPathnameContext.Consumer>
          </RightInner>
        </Right>
      </Container>
    );
  }
}
