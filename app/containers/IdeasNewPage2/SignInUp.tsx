import React from 'react';

// components
import Icon from 'components/UI/Icon';
import SignIn from 'components/SignIn';
import SignUp from 'components/SignUp';
import SignInUpBanner from 'components/SignInUpBanner';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

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
  border-top: solid 1px #ddd;
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
  padding-left: 50vw;

  ${media.smallerThanMaxTablet`
    padding: 0;
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

const FormContainer = styled.div``;

const GoBackContainer = styled.div`
  display: inline-flex;
  align-items: center;
  margin-left: -3px;
  margin-bottom: 20px;
  cursor: pointer;

  &:hover {
    svg {
      fill: #000;
    }

    span {
      color: #000;
    }
  }

  svg {
    fill: #999;
    height: 26px;
  }

  span {
    color: #999;
    font-size: 18px;
    font-weight: 400;
    padding-left: 1px;
  }
`;

const Form = styled.div`
  width: 100%;
  max-width: 600px;
`;

type Props = {
  onGoBack?: () => void;
  onSignInUpCompleted: (userId: string) => void;
};

type State = {
  show: 'signIn' | 'signUp';
};

export default class SignInUp extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      show: 'signIn'
    };
  }

  goBack = () => {
    this.props.onGoBack && this.props.onGoBack();
  }

  goToSignUpForm = () => {
    this.setState({ show: 'signUp' });
  }

  goToSignInForm = () => {
    this.setState({ show: 'signIn' });
  }

  handleOnSignedIn = (userId: string) => {
    this.props.onSignInUpCompleted(userId);
  }

  handleOnSignUpCompleted = (userId: string) => {
    this.props.onSignInUpCompleted(userId);
  }

  render() {
    const { show } = this.state;
    const { onGoBack } = this.props;

    const signIn = (show === 'signIn' ? (
      <FormContainer>
        <Form>
          <SignIn
            title={<FormattedMessage {...messages.signInTitle} />}
            onSignedIn={this.handleOnSignedIn}
            goToSignUpForm={this.goToSignUpForm}
          />
        </Form>
      </FormContainer>
    ) : null);

    const signUp = (show === 'signUp' ? (
      <FormContainer>
        <Form>
          <SignUp
            step1Title={<FormattedMessage {...messages.signUpTitle} />}
            onSignUpCompleted={this.handleOnSignUpCompleted}
          />
        </Form>
      </FormContainer>
    ) : null);

    return (
      <Container>
        <Left>
          <SignInUpBanner />
        </Left>
        <Right>
          <RightInner>
            {onGoBack &&
              <GoBackContainer onClick={this.goBack}>
                <Icon name="arrow-back" />
                <span><FormattedMessage {...messages.goBack} /></span>
              </GoBackContainer>
            }
            {signIn}
            {signUp}
          </RightInner>
        </Right>
      </Container>
    );
  }
}
