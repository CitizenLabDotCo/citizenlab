import * as React from 'react';
import * as _ from 'lodash';
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
import { getLocalized } from 'utils/i18n';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import messages from './messages';

// style
import { darken } from 'polished';
import styled from 'styled-components';

// typings
import { API } from 'typings.d';

const Container = styled.div`
  width: 100%;
`;

const Form = styled.div`
  width: 100%;
  height: auto;
  max-width: 360px;
  position: relative;
  -webkit-backface-visibility: hidden;
  will-change: auto;

  &.form-enter {
    opacity: 0.01;
    position: absolute;
    will-change: opacity, transform;

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
    will-change: opacity, transform;

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
  onSignUpCompleted: () => void;
};

type State = {
  showStep1: boolean;
  hasStep2: boolean;
  currentTenant: ITenant | null;
};

class SignUp extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      showStep1: true,
      hasStep2: true,
      currentTenant: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const currentTenant$ = currentTenantStream().observable;
    this.subscriptions = [
      currentTenant$.subscribe((currentTenant) => {
        const { birthyear, domicile, education, gender } = currentTenant.data.attributes.settings.demographic_fields;
        const hasStep2 = [birthyear, domicile, education, gender].some(value => value === true);
        console.log('hasStep2: ' + hasStep2);
        this.setState({ currentTenant, hasStep2 });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleStep1Completed = () => {
    if (this.state.hasStep2) {
      this.setState({ showStep1: false });
    } else {
      this.props.onSignUpCompleted();
    }
  }

  handleStep2Completed = () => {
    this.props.onSignUpCompleted();
  }

  goToSignIn = () => {
    browserHistory.push('/sign-in');
  }

  render() {
    const { showStep1, hasStep2 } = this.state;
    const timeout = 600;

    const step1 = (showStep1 ? (
      <CSSTransition classNames="form" timeout={timeout}>
        <Form className="step1">
          <Step1 onCompleted={this.handleStep1Completed} />
        </Form>
      </CSSTransition>
    ) : null);

    const step2 = ((!showStep1 && hasStep2) ? (
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
