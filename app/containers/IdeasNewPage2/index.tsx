import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import { injectIntl, intlShape } from 'react-intl';
import { browserHistory } from 'react-router';
import { injectTFunc } from 'utils/containers/t/utils';
import { stateStream, IStateStream } from 'services/state';
import styled from 'styled-components';
import messages from './messages';
import NewIdeaForm from './NewIdeaForm';
import SignInUp from './SignInUp';

const Container = styled.div`
  background: #f4f4f4;
`;

const PageContainer = styled.div`
  width: 100%;
  min-height: calc(100vh - 65px);
  padding-top: 40px;
  padding-bottom: 100px;
  background: #f4f4f4;
  position: relative;
  -webkit-backface-visibility: hidden;
  will-change: auto;

  &.page-enter {
    transform: translateX(100vw);
    position: absolute;
    will-change: transform;

    &.ideaForm {
      transform: translateX(-100vw);
    }

    &.page-enter-active {
      transform: translateX(0);
      transition: transform 3000ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }

  &.page-leave {
    transform: translateX(0);
    will-change: transform;

    &.page-leave-active {
      transform: translateX(100vw);
      transition: transform 3000ms cubic-bezier(0.165, 0.84, 0.44, 1);

      &.ideaForm {
        transform: translateX(-100vw);
      }
    }
  }
`;

type Props = {
  intl: ReactIntl.InjectedIntl;
  tFunc: Function;
  locale: string;
};

type State = {
  showIdeaForm: boolean;
};

class IdeasNewPage2 extends React.PureComponent<Props, State> {
  state$: IStateStream<State>;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state$ = stateStream.observe<State>('IdeasNewPage2', { showIdeaForm: true });
    this.subscriptions = [];
  }

  componentWillMount() {
    this.subscriptions = [
      this.state$.observable.subscribe(state => this.setState(state as State)),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleOnSubmit = async () => {
    // browserHistory.push('/ideas');
  }

  render() {
    const { showIdeaForm } = this.state;
    const { intl, tFunc, locale } = this.props;
    const { formatMessage } = this.props.intl;

    return (
      <Container>
        <CSSTransitionGroup
          transitionName="form"
          transitionEnterTimeout={3000}
          transitionLeaveTimeout={3000}
        >
          {showIdeaForm ? (
            <PageContainer className="ideaForm">
              <NewIdeaForm />
            </PageContainer>
          ) : (
            <PageContainer>
              <SignInUp intl={intl} tFunc={tFunc} locale={locale} />
            </PageContainer>
          )}
        </CSSTransitionGroup>
      </Container>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  locale: makeSelectLocale(),
});

export default injectTFunc(injectIntl(connect(mapStateToProps, null)(IdeasNewPage2)));
