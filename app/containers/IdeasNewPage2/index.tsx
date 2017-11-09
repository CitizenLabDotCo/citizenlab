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
import Upload from 'components/UI/Upload';
import ButtonBar, { namespace as ButtonBarNamespace, State as IButtonBarState } from './ButtonBar';
import NewIdeaForm, { namespace as NewIdeaFormNamespace, State as INewIdeaFormState } from './NewIdeaForm';
import SignInUp from './SignInUp';

// services
import { state, IStateStream } from 'services/state';
import { localeStream } from 'services/locale';
import { addDraftIdea, updateIdea } from 'services/ideas';
import { addIdeaImage } from 'services/ideaImages';
import { getAuthUserAsync } from 'services/auth';

// utils
import { getBase64 } from 'utils/imageTools';

// i18n
import { injectIntl, InjectedIntlProps } from 'react-intl';
import messages from './messages';

// style
import { media } from 'utils/styleUtils';
import styled from 'styled-components';

const Container = styled.div`
  background: #f8f8f8;
`;

const PageContainer = styled.div`
  width: 100%;
  min-height: calc(100vh - 105px);
  position: relative;
  background: #f8f8f8;
  -webkit-backface-visibility: hidden;
  will-change: opacity, transform;

  &.page-enter {
    position: absolute;
    opacity: 0.01;
    transform: translateX(100vw);

    ${media.biggerThanMaxTablet`
      transform: translateX(800px);
    `}

    &.ideaForm {
      transform: translateX(-100vw);

      ${media.biggerThanMaxTablet`
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

      ${media.biggerThanMaxTablet`
        transform: translateX(800px);
      `}

      &.ideaForm {
        transform: translateX(-100vw);

        ${media.biggerThanMaxTablet`
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
  border-top: solid 1px #ddd;
  -webkit-backface-visibility: hidden;
  will-change: auto;

  ${media.smallerThanMaxTablet`
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
  showIdeaForm: boolean;
  locale: string | null;
  ideaId: string | null;
};

export const namespace = 'IdeasNewPage2/index';

class IdeasNewPage2 extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  newIdeaFormState$: IStateStream<INewIdeaFormState>;
  buttonBarState$: IStateStream<IButtonBarState>;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();

    const initialNewIdeaFormState: INewIdeaFormState = {
      locale: null,
      topics: null,
      projects: null,
      title: null,
      description: EditorState.createEmpty(),
      selectedTopics: null,
      selectedProject: null,
      location: null,
      images: null,
      titleError: null,
      descriptionError: null,
      submitError: false,
      processing: false
    };

    const initialButtonBarState: IButtonBarState = {
      submitError: false,
      processing: false
    };

    this.newIdeaFormState$ = state.createStream<INewIdeaFormState>(namespace, NewIdeaFormNamespace, initialNewIdeaFormState);
    this.buttonBarState$ = state.createStream<IButtonBarState>(namespace, ButtonBarNamespace, initialButtonBarState);

    this.state = {
      showIdeaForm: true,
      locale: null,
      ideaId: null
    };

    this.subscriptions = [];
  }

  componentWillMount() {
    const locale$ = localeStream().observable;

    this.subscriptions = [
      this.buttonBarState$.observable.subscribe(),
      this.newIdeaFormState$.observable.subscribe(),
      locale$.subscribe(locale => this.setState({ locale }))
    ];
  }

  async componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  async convertToGeoJson(location: string) {
    const results = await geocodeByAddress(location);
    const { lat, lng } = await getLatLng(results[0]);
    return {
      type: 'Point',
      coordinates: [lat as number, lng as number]
    };
  }

  async postDraftIdea(locale: string, newIdeaFormState: INewIdeaFormState) {
    const { ideaId } = this.state;
    const { topics, projects, title, description, selectedTopics, selectedProject, location } = newIdeaFormState;
    const ideaTitle = { [locale]: title as string };
    const ideaDescription = { [locale]: draftToHtml(convertToRaw(description.getCurrentContent())) };
    const topicIds = (selectedTopics ? selectedTopics.map(topic => topic.value) : null);
    const projectId = (selectedProject ? selectedProject.value as string : null);
    const locationGeoJSON = (_.isString(location) && !_.isEmpty(location) ? await this.convertToGeoJson(location) : null);
    const locationDescription = (_.isString(location) && !_.isEmpty(location) ? location : null);
    
    if (!ideaId) {
      return await addDraftIdea('draft', ideaTitle, ideaDescription, topicIds, projectId, locationGeoJSON, locationDescription);
    } else {
      return await updateIdea(ideaId, {
        title_multiloc: ideaTitle,
        body_multiloc: ideaDescription,
        topic_ids: topicIds,
        project_id: projectId,
        location_point_geojson: locationGeoJSON,
        location_description: locationDescription
      });
    }
  }

  async postIdeaImage(ideaId: string, image: ImageFile) {
    try {
      const base64Image = await getBase64(image);
      return await addIdeaImage(ideaId, base64Image, 0);
    } catch (error) {
      return error;
    }
  }

  async postDraftIdeaAndIdeaImage(locale: string) {
    try {
      const currentNewIdeaFormState = await this.newIdeaFormState$.getCurrent();
      const { images } = currentNewIdeaFormState;
      const idea = await this.postDraftIdea(locale, currentNewIdeaFormState);
      images && images.length > 0 && await this.postIdeaImage(idea.data.id, images[0]);
      return idea;
    } catch (error) {
      throw 'error';
    }
  }

  handleOnIdeaSubmit = (locale: string) => async () => {
    this.setSubmitErrorTo(false);
    this.setProcessingTo(true);

    try {
      const authUser = await getAuthUserAsync();
      const idea = await this.postDraftIdeaAndIdeaImage(locale);
      this.setState({ ideaId: idea.data.id });
      this.setProcessingTo(false);
      // browserHistory.push('/ideas');
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
    this.newIdeaFormState$.next({ processing });
    this.buttonBarState$.next({ processing });
  }

  setSubmitErrorTo(submitError: boolean) {
    this.newIdeaFormState$.next({ submitError });
    this.buttonBarState$.next({ submitError });
  }

  handleOnSignInUpGoBack = () => {
    this.setState({ showIdeaForm: true });
  }

  handleOnSignInUpCompleted = async (userId: string) => {
    const { ideaId } = this.state;

    if (ideaId) {
      await updateIdea(ideaId, { author_id: userId, publication_status: 'published' });
      browserHistory.push('/ideas');
    }
  }

  render() {
    const { showIdeaForm, locale } = this.state;
    const { intl } = this.props;
    const timeout = 600;

    const buttonBar = (showIdeaForm && locale) ? (
      <CSSTransition classNames="buttonbar" timeout={timeout}>
        <ButtonBarContainer>
          <ButtonBar onSubmit={this.handleOnIdeaSubmit(locale)} />
        </ButtonBarContainer>
      </CSSTransition>
    ) : null;

    const newIdeasForm = (showIdeaForm && locale) ? (
      <CSSTransition classNames="page" timeout={timeout}>
        <PageContainer className="ideaForm">
          <NewIdeaForm onSubmit={this.handleOnIdeaSubmit(locale)} />
        </PageContainer>
      </CSSTransition>
    ) : null;

    const signInUp = (!showIdeaForm && locale) ? (
      <CSSTransition classNames="page" timeout={timeout}>
        <PageContainer>
          <SignInUp
            onGoBack={this.handleOnSignInUpGoBack}
            onSignInUpCompleted={this.handleOnSignInUpCompleted}
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

export default injectIntl<Props>(IdeasNewPage2);
