import React from 'react';
import { adopt } from 'react-adopt';

// libraries
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';
import { browserHistory } from 'react-router';

// components
import Step1 from './Step1';
import Step2 from './Step2';
import Footer from './Footer';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetCustomFieldsSchema, { GetCustomFieldsSchemaChildProps } from 'resources/GetCustomFieldsSchema';

// utils
import eventEmitter from 'utils/eventEmitter';
import { hasCustomFields } from 'utils/customFields';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';

const timeout = 900;
const easing = 'cubic-bezier(0.165, 0.84, 0.44, 1)';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const ContainerInner = styled.div`
  width: 100%;
  position: relative;
  flex: 1;
`;

const StepContainer = styled.div`
  position: relative;

  &.step-enter {
    width: 100%;
    max-width: 420px;
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    z-index: 1;
    transform: translateX(150px);

    &.step-enter-active {
      width: 100%;
      max-width: 420px;
      position: absolute;
      top: 0;
      left: 0;
      opacity: 1;
      transform: translateX(0);
      transition: all ${timeout}ms ${easing};
    }
  }

  &.step-exit {
    width: 100%;
    max-width: 420px;
    position: absolute;
    top: 0;
    left: 0;
    opacity: 1;
    transform: translateX(0);

    &.step-exit-active {
      width: 100%;
      max-width: 420px;
      position: absolute;
      top: 0;
      left: 0;
      opacity: 0;
      transform: translateX(-150px);
      transition: all ${timeout}ms ${easing};
    }
  }
`;

const Title = styled.h2`
  width: 100%;
  color: #333;
  font-size: 34px;
  line-height: 42px;
  font-weight: 500;
  text-align: left;
  margin-bottom: 35px;
`;

interface InputProps {
  isInvitation?: boolean | undefined;
  token?: string | null | undefined;
  step1Title?: string | JSX.Element;
  step2Title?: string | JSX.Element;
  onSignUpCompleted: (userId: string) => void;
}

interface DataProps {
  locale: GetLocaleChildProps;
  customFieldsSchema: GetCustomFieldsSchemaChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  visibleStep: 'step1' | 'step2';
  userId: string | null;
}

class SignUp extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      visibleStep: 'step1',
      userId: null
    };
  }

  handleStep1Completed = (userId: string) => {
    const { customFieldsSchema, locale } = this.props;

    this.setState({ userId });

    if (hasCustomFields(customFieldsSchema, locale)) {
      eventEmitter.emit('SignUp', 'signUpFlowGoToSecondStep', null);
      this.setState({ visibleStep: 'step2' });
    } else {
      this.props.onSignUpCompleted(userId);
    }
  }

  handleStep2Completed = () => {
    const { userId } = this.state;

    if (userId) {
      this.props.onSignUpCompleted(userId);
    }
  }

  goToSignIn = () => {
    browserHistory.push('/sign-in');
  }

  render() {
    const { visibleStep } = this.state;
    const { isInvitation, token, step1Title, step2Title } = this.props;

    return (
      <Container>
        <ContainerInner>
          <TransitionGroup>
            {visibleStep === 'step1' &&
              <CSSTransition
                timeout={timeout}
                classNames="step"
              >
                <StepContainer>
                  <Title>
                    {step1Title || <FormattedMessage {...messages.step1Title} />}
                  </Title>

                  <Step1
                    isInvitation={isInvitation}
                    token={token}
                    onCompleted={this.handleStep1Completed}
                  />

                  {!isInvitation &&
                    <Footer goToSignIn={this.goToSignIn} />
                  }
                </StepContainer>
              </CSSTransition>
            }

            {visibleStep === 'step2' &&
              <CSSTransition
                timeout={timeout}
                classNames="step"
              >
                <StepContainer>
                  <Title>{step2Title || <FormattedMessage {...messages.step2Title} />}</Title>
                  <Step2 onCompleted={this.handleStep2Completed} />
                </StepContainer>
              </CSSTransition>
            }
          </TransitionGroup>
        </ContainerInner>
      </Container>
    );
  }
}

const Data = adopt<DataProps>({
  locale: <GetLocale />,
  customFieldsSchema: <GetCustomFieldsSchema />
});

export default (inputProps: InputProps) => (
  <Data>
    {dataProps => <SignUp {...inputProps} {...dataProps} />}
  </Data>
);
