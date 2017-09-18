import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import CSSTransition from 'react-transition-group/CSSTransition';
import Transition from 'react-transition-group/Transition';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import { browserHistory } from 'react-router';
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { ImageFile } from 'react-dropzone';

// components
import Upload, { ExtendedImageFile } from 'components/UI/Upload';
import ButtonBar from './ButtonBar';
import IdeaForm from './IdeaForm';
import SignInUp from 'components/SignInUp';

// services
import { localeStream } from 'services/locale';
import { addIdea } from 'services/ideas';
import { addIdeaImage } from 'services/ideaImages';
import { getAuthUserAsync } from 'services/auth';

// i18n
import { injectIntl, InjectedIntlProps } from 'react-intl';
import messages from './messages';

// style
import { media } from 'utils/styleUtils';
import styled from 'styled-components';

const Container = styled.div`
  background: #f2f2f2;
`;

const PageContainer = styled.div`
  width: 100%;
  min-height: calc(100vh - 105px);
  padding-top: 40px;
  position: relative;
  background: #f2f2f2;
  -webkit-backface-visibility: hidden;
  will-change: opacity, transform;

  &.page-enter {
    position: absolute;
    opacity: 0.01;
    transform: translateX(100vw);

    ${media.desktop`
      transform: translateX(800px);
    `}

    &.ideaForm {
      transform: translateX(-100vw);

      ${media.desktop`
        transform: translateX(-800px);
      `}
    }

    &.page-enter-active {
      opacity: 1;
      transform: translateX(0);
      transition: transform 600ms cubic-bezier(0.19, 1, 0.22, 1),
                  opacity 600ms cubic-bezier(0.19, 1, 0.22, 1);
    }
  }

  &.page-exit {
    opacity: 1;
    transform: translateX(0);

    &.page-exit-active {
      opacity: 0.01;
      transform: translateX(100vw);
      transition: transform 600ms cubic-bezier(0.19, 1, 0.22, 1),
                  opacity 600ms cubic-bezier(0.19, 1, 0.22, 1);

      ${media.desktop`
        transform: translateX(800px);
      `}

      &.ideaForm {
        transform: translateX(-100vw);

        ${media.desktop`
          transform: translateX(-800px);
        `}
      }
    }
  }
`;

const ButtonBarContainer = styled.div`
  width: 100%;
  height: 68px;
  position: fixed;
  z-index: 99999;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  box-shadow: 0 -1px 1px 0 rgba(0, 0, 0, 0.12);
  -webkit-backface-visibility: hidden;
  will-change: auto;

  ${media.phone`
    display: none;
  `}

  &.buttonbar-enter {
    transform: translateY(64px);
    will-change: transform;

    &.buttonbar-enter-active {
      transform: translateY(0);
      transition: transform 600ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }

  &.buttonbar-exit {
    transform: translateY(0);
    will-change: transform;

    &.buttonbar-exit-active {
      transform: translateY(64px);
      transition: transform 600ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }
`;

type Props = {};

type State = {
  locale: string | null;
  showIdeaForm: boolean;
};

class IdeasNewPage2 extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      locale: null,
      showIdeaForm: true,
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const locale$ = localeStream().observable;

    this.subscriptions = [
      locale$.subscribe(locale => this.setState({ locale }))
    ];
  }

  async componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    // const currentNewIdeaFormState = await this.newIdeaFormState$.getCurrent();
    // _(currentNewIdeaFormState.images).forEach(image => image.preview && window.URL.revokeObjectURL(image.preview));
  }

  handleOnIdeaSubmit = async () => {
    const { intl } = this.props;
    const { locale } = this.state;

    this.setSubmitErrorTo(false);
    this.setProcessingTo(true);

    try {
      const authUser = await getAuthUserAsync();
      await this.postIdeaAndIdeaImage(authUser.data.id);
      this.setProcessingTo(false);
      browserHistory.push('/ideas');
    } catch (error) {
      this.setProcessingTo(false);

      if (_.isError(error) && error.message === 'not authenticated') {
        window.scrollTo(0, 0);
        this.setState({ showIdeaForm: false });
      } else {
        this.setSubmitErrorTo(true);
      }
    }
  }

  setProcessingTo(processing: boolean) {
    this.newIdeaFormsetState({ processing });
    this.buttonBarsetState({ processing });
  }

  setSubmitErrorTo(submitError: boolean) {
    this.newIdeaFormsetState({ submitError });
    this.buttonBarsetState({ submitError });
  }

  handleOnSignInUpGoBack = () => {
    this.setState({ showIdeaForm: true });
  }

  handleOnSignInUpCompleted = () => {
    this.handleOnIdeaSubmit();
  }

  render() {
    const { showIdeaForm, locale } = this.state;
    const { intl } = this.props;
    const timeout = 600;

    const buttonBar = (showIdeaForm && locale) ? (
      <CSSTransition classNames="buttonbar" timeout={timeout}>
        <ButtonBarContainer>
          <ButtonBar />
        </ButtonBarContainer>
      </CSSTransition>
    ) : null;

    const newIdeasForm = (showIdeaForm && locale) ? (
      <CSSTransition classNames="page" timeout={timeout}>
        <PageContainer className="ideaForm">
          <IdeaForm />
        </PageContainer>
      </CSSTransition>
    ) : null;

    const signInUp = (!showIdeaForm && locale) ?  (
      <CSSTransition classNames="page" timeout={timeout}>
        <PageContainer>
          <SignInUp
            onGoBack={this.handleOnSignInUpGoBack}
            onSignInUpCompleted={this.handleOnSignInUpCompleted}
            signInTitleMessage={messages.signInTitle}
            signUpTitleMessage={messages.signUpTitle}
          />
        </PageContainer>
      </CSSTransition>
    ) : null;

    return (
      <Container>
        <TransitionGroup>
          {buttonBar}
          {newIdeasForm}
          {signInUp}
        </TransitionGroup>
      </Container>
    );
  }
}

export default injectIntl(IdeasNewPage2);
