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

// components
import ButtonBar from './ButtonBar';
import NewIdeaForm from './NewIdeaForm';
import SignInUp from './SignInUp';

// services
import { localeStream } from 'services/locale';
import { addIdea, updateIdea } from 'services/ideas';
import { addIdeaImage, deleteIdeaImage, IIdeaImage } from 'services/ideaImages';
import { getAuthUserAsync } from 'services/auth';
import { localState, ILocalStateService } from 'services/localState';
import { globalState, IGlobalStateService, IIdeasNewPageGlobalState } from 'services/globalState';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { IOption, ImageFile } from 'typings';

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
  will-change: auto;

  &.page-enter {
    position: absolute;
    opacity: 0.01;
    transform: translateX(100vw);
    will-change: opacity, transform;

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
    will-change: opacity, transform;

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

interface Props {}

interface LocalState {
  showIdeaForm: boolean;
  locale: string | null;
}

interface GlobalState {}

interface State extends LocalState, GlobalState {}

class IdeasNewPage2 extends React.PureComponent<Props, State> {
  initialLocalState: LocalState;
  initialGlobalState: IIdeasNewPageGlobalState;
  localState: ILocalStateService<LocalState>;
  globalState: IGlobalStateService<IIdeasNewPageGlobalState>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    const initialLocalState = {
      showIdeaForm: true,
      locale: null
    };
    this.initialGlobalState = {
      title: null,
      description: EditorState.createEmpty(),
      selectedTopics: null,
      selectedProject: null,
      location: null,
      titleError: null,
      descriptionError: null,
      submitError: false,
      processing: false,
      ideaId: null,
      imageFile: null,
      imageBase64: null,
      imageId: null,
      imageChanged: false
    };
    this.localState = localState<LocalState>(initialLocalState);
    this.globalState = globalState.init<IIdeasNewPageGlobalState>('IdeasNewPage', this.initialGlobalState);
    this.subscriptions = [];
  }

  componentWillMount() {
    const localState$ = this.localState.observable;
    const locale$ = localeStream().observable;

    this.subscriptions = [
      localState$.subscribe(({ showIdeaForm, locale }) => {
        const newState: State = { showIdeaForm, locale };
        this.setState(newState);
      }),
      locale$.subscribe(locale => this.localState.set({ locale }))
    ];
  }

  componentWillUnmount() {
    // reset global state before unmounting
    this.globalState.set(this.initialGlobalState);
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

  async postIdea(publicationStatus: 'draft' | 'published', authorId: string | null = null) {
    const { locale } = await this.localState.get();
    const { title, description, selectedTopics, selectedProject, location, ideaId } = await this.globalState.get();
    const ideaTitle = { [locale as string]: title as string };
    const ideaDescription = { [locale as string]: draftToHtml(convertToRaw(description.getCurrentContent())) };
    const topicIds = (selectedTopics ? selectedTopics.map(topic => topic.value) : null);
    const projectId = (selectedProject ? selectedProject.value as string : null);
    const locationGeoJSON = (_.isString(location) && !_.isEmpty(location) ? await this.convertToGeoJson(location) : null);
    const locationDescription = (_.isString(location) && !_.isEmpty(location) ? location : null);

    if (ideaId) {
      return await updateIdea(ideaId, {
        title_multiloc: ideaTitle,
        body_multiloc: ideaDescription,
        topic_ids: topicIds,
        project_id: projectId,
        location_point_geojson: locationGeoJSON,
        location_description: locationDescription
      });
    }

    return await addIdea(
      authorId,
      publicationStatus,
      ideaTitle,
      ideaDescription,
      topicIds,
      projectId,
      locationGeoJSON,
      locationDescription
    );
  }

  async postIdeaAndIdeaImage(publicationStatus: 'draft' | 'published', authorId: string | null = null) {
    try {
      let ideaImage: IIdeaImage | null = null;
      const { imageBase64, imageId, imageChanged } = await this.globalState.get();

      const idea = await this.postIdea(publicationStatus, authorId);

      // check if an image was previously saved and changed afterwards
      // if so, delete the old image from the server first before uplaoding the new one
      if (imageId && imageChanged) {
        await deleteIdeaImage(idea.data.id, imageId);
      }

      // upload the newly dropped image to the server
      if (imageChanged && imageBase64) {
        ideaImage = await addIdeaImage(idea.data.id, imageBase64, 0);
      }

      this.globalState.set({
        ideaId: idea.data.id,
        imageId: (ideaImage ? ideaImage.data.id : null),
        imageChanged: false
      });

      return idea;
    } catch (error) {
      throw 'error';
    }
  }

  handleOnIdeaSubmit = async () => {
    this.globalState.set({ submitError: false, processing: true });

    try {
      const authUser = await getAuthUserAsync();
      const idea = await this.postIdeaAndIdeaImage('published', authUser.data.id);
      browserHistory.push('/ideas');
    } catch (error) {
      if (_.isError(error) && error.message === 'not_authenticated') {
        try {
          const idea = await this.postIdeaAndIdeaImage('draft');
          this.globalState.set({ processing: false });
          this.localState.set({ showIdeaForm: false });
          window.scrollTo(0, 0);
        } catch (error) {
          this.globalState.set({ processing: false, submitError: true });
        }
      } else {
        this.globalState.set({ processing: false, submitError: true });
      }
    }
  }

  handleOnSignInUpGoBack = () => {
    this.localState.set({ showIdeaForm: true });
  }

  handleOnSignInUpCompleted = async (userId: string) => {
    const { ideaId } = await this.globalState.get();

    if (ideaId) {
      await updateIdea(ideaId, { author_id: userId, publication_status: 'published' });
      browserHistory.push('/ideas');
    }
  }

  render() {
    if (!this.state) { return null; }

    const { showIdeaForm, locale } = this.state;
    const timeout = 600;

    const buttonBar = (showIdeaForm && locale) ? (
      <CSSTransition classNames="buttonbar" timeout={timeout}>
        <ButtonBarContainer>
          <ButtonBar onSubmit={this.handleOnIdeaSubmit} />
        </ButtonBarContainer>
      </CSSTransition>
    ) : null;

    const newIdeasForm = (showIdeaForm && locale) ? (
      <CSSTransition classNames="page" timeout={timeout}>
        <PageContainer className="ideaForm">
          <NewIdeaForm onSubmit={this.handleOnIdeaSubmit} />
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

export default IdeasNewPage2;
