import * as React from 'react';
import { get } from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';
import { browserHistory } from 'react-router';

// components
import Step1 from './Step1';
import Step2 from './Step2';
import Footer from './Footer';

// services
import { currentTenantStream, ITenant } from 'services/tenant';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// style
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
`;

const Form = styled.div`
  width: 100%;
  height: auto;
  max-width: 360px;
  position: relative;
  will-change: opacity, transform;

  &.form-enter {
    opacity: 0.01;
    position: absolute;

    &.step1 {
      transform: translateX(-100px);
    }

    &.step2 {
      transform: translateX(100px);
    }

    &.form-enter-active {
      opacity: 1;
      transform: translateX(0);
      transition: opacity 600ms cubic-bezier(0.165, 0.84, 0.44, 1),
                  transform 600ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }

  &.form-exit {
    opacity: 1;

    &.step1 {
      height: 447px;
    }

    &.step2 {
      height: 340px;
    }

    &.form-exit-active {
      opacity: 0.01;
      transition: opacity 600ms cubic-bezier(0.165, 0.84, 0.44, 1),
                  transform 600ms cubic-bezier(0.165, 0.84, 0.44, 1),
                  height 600ms cubic-bezier(0.165, 0.84, 0.44, 1);

      &.step1 {
        height: 340px;
        transform: translateX(-100px);
      }

      &.step2 {
        height: 447px;
        transform: translateX(100px);
      }
    }
  }
`;

type Props = {
  onSignUpCompleted: (userId: string) => void;
};

type State = {
  visibleStep: 'step1' | 'step2'
  hasSecondStep: boolean;
  currentTenant: ITenant | null;
  userId: string | null;
};

class SignUp extends React.PureComponent<Props & InjectedIntlProps, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      visibleStep: 'step1',
      hasSecondStep: true,
      currentTenant: null,
      userId: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const currentTenant$ = currentTenantStream().observable.do((currentTenant) => {
      const { birthyear, domicile, gender } = currentTenant.data.attributes.settings.demographic_fields;
      const demographicFieldsEnabled = get(currentTenant, `data.attributes.settings.demographic_fields.enabled`);
      const hasOneOrMoreActiveDemographicFields = [birthyear, domicile, gender].some(value => value === true);

      if (!demographicFieldsEnabled || !hasOneOrMoreActiveDemographicFields) {
        this.setState(({ hasSecondStep: false }));
      }
    });

    this.subscriptions = [currentTenant$.subscribe(currentTenant => this.setState({ currentTenant }))];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleStep1Completed = (userId: string) => {
    this.setState({ userId });

    if (this.state.hasSecondStep) {
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
    const timeout = 600;

    const step1 = (visibleStep === 'step1' ? (
      <CSSTransition classNames="form" timeout={timeout}>
        <Form className="step1">
          <Step1 onCompleted={this.handleStep1Completed} />
        </Form>
      </CSSTransition>
    ) : null);

    const step2 = (visibleStep === 'step2' ? (
      <CSSTransition classNames="form" timeout={timeout}>
        <Form className="step2">
          <Step2 onCompleted={this.handleStep2Completed} />
        </Form>
      </CSSTransition>
    ) : null);

    return (
      <Container>
        <TransitionGroup>
          {step1}
          {step2}
        </TransitionGroup>
        <Footer goToSignIn={this.goToSignIn} />
      </Container>
    );
  }
}

export default injectIntl<Props>(SignUp);
