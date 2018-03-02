import * as React from 'react';
import { isEmpty } from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import CSSTransition from 'react-transition-group/CSSTransition';
import { browserHistory } from 'react-router';

// components
import Step1 from './Step1';
import Step2 from './Step2';
import Footer from './Footer';

// services
import { localeStream } from 'services/locale';
import { customFieldsSchemaForUsersStream } from 'services/userCustomFields';

// utils
import eventEmitter from 'utils/eventEmitter';

// style
import styled from 'styled-components';

const timeout = 850;
const easing = 'cubic-bezier(0.165, 0.84, 0.44, 1)';

const Container = styled.div``;

const StepContainer = styled.div`
  position: relative;
  display: none;

  &.visible {
    display: block;
  }

  &.step-enter {
    opacity: 0;
    position: absolute;
    transform: translateX(-400px);

    &.step-enter-active {
      transition: opacity ${timeout}ms ${easing},
                  transform ${timeout}ms ${easing},
                  height ${timeout}ms ${easing};
    }
  }

  &.step-exit {
    &.step-exit-active {
      opacity: 0;
      transform: translateX(-400px);
      transition: opacity ${timeout}ms ${easing},
                  transform ${timeout}ms ${easing},
                  height ${timeout}ms ${easing};
    }
  }
`;

type Props = {
  onSignUpCompleted: (userId: string) => void;
};

type State = {
  loaded: boolean;
  visibleStep: 'step1' | 'step2';
  hasSecondStep: boolean;
  userId: string | null;
};

export default class SignUp extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      loaded: false,
      visibleStep: 'step1',
      hasSecondStep: true,
      userId: null,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const customFieldsSchemaForUsersStream$ = customFieldsSchemaForUsersStream().observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        customFieldsSchemaForUsersStream$
      ).subscribe(([locale, customFieldsSchema]) => {
        const hasSecondStep = !isEmpty(customFieldsSchema['json_schema_multiloc'][locale]['properties']);
        this.setState({ hasSecondStep });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleStep1Completed = (userId: string) => {
    this.setState({ userId });

    if (this.state.hasSecondStep) {
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

  goToHomePage = () => {
    browserHistory.push('/');
  }

  goToSignIn = () => {
    browserHistory.push('/sign-in');
  }

  render() {
    const { visibleStep } = this.state;

    return (
      <Container>
        <CSSTransition
          in={(visibleStep === 'step1')}
          timeout={timeout}
          enter={false}
          exit={true}
          classNames="step"
        >
          <StepContainer className={`${visibleStep === 'step1' && 'visible'}`}>
            <Step1 onCompleted={this.handleStep1Completed} />
            <Footer goToSignIn={this.goToSignIn} />
          </StepContainer>
        </CSSTransition>

        <CSSTransition
          in={(visibleStep === 'step2')}
          timeout={timeout}
          enter={true}
          exit={false}
          classNames="step"
        >
          <StepContainer className={`${visibleStep === 'step2' && 'visible'}`}>
            <Step2 onCompleted={this.handleStep2Completed} />
          </StepContainer>
        </CSSTransition>
      </Container>
    );
  }
}
