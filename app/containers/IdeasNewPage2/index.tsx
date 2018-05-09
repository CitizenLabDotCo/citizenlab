import React from 'react';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import isString from 'lodash/isString';
import isEmpty from 'lodash/isEmpty';
import isError from 'lodash/isError';
import { isNilOrError } from 'utils/helperUtils';

// libraries
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import { browserHistory, withRouter, WithRouterProps } from 'react-router';

// components
import IdeasNewButtonBar from './IdeasNewButtonBar';
import NewIdeaForm from './NewIdeaForm';
import SignInUp from './SignInUp';

// services
import { localeStream } from 'services/locale';
import { addIdea, updateIdea, IIdeaAdd } from 'services/ideas';
import { addIdeaImage, deleteIdeaImage, IIdeaImage } from 'services/ideaImages';
import { getAuthUserAsync } from 'services/auth';
import { localState, ILocalStateService } from 'services/localState';
import { globalState, IGlobalStateService, IIdeasNewPageGlobalState } from 'services/globalState';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

// utils
import { convertToGeoJson, reverseGeocode } from 'utils/locationTools';

// typings
import { Locale } from 'typings';

// style
import { media } from 'utils/styleUtils';
import styled from 'styled-components';

const timeout = 600;

const Container = styled.div`
  background: #f9f9fa;
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
  `}
`;

const ContainerInner = styled.div`
  &.hidden {
    display: none;
  }
`;

const PageContainer = styled.div`
  width: 100%;
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  position: relative;
  will-change: transform, opacity;

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
  `}

  &.page-enter {
    position: absolute;
    opacity: 0;
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
      transition: transform ${timeout}ms cubic-bezier(0.19, 1, 0.22, 1),
                  opacity ${timeout}ms cubic-bezier(0.19, 1, 0.22, 1);
    }
  }

  &.page-exit {
    opacity: 1;
    transform: translateX(0);

    &.page-exit-active {
      opacity: 0;
      transform: translateX(100vw);
      transition: transform ${timeout}ms cubic-bezier(0.19, 1, 0.22, 1),
                  opacity ${timeout}ms cubic-bezier(0.19, 1, 0.22, 1);

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
  z-index: 2;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: solid 1px #ddd;

  ${media.phone`
    display: none;
  `}

  &.buttonbar-enter {
    transform: translateY(64px);

    &.buttonbar-enter-active {
      transform: translateY(0);
      transition: transform ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }

  &.buttonbar-exit {
    transform: translateY(0);

    &.buttonbar-exit-active {
      transform: translateY(64px);
      transition: transform ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }
`;

interface InputProps {}

interface DataProps {
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

interface LocalState {
  showIdeaForm: boolean;
  locale: Locale | null;
  publishing: Boolean;
}

interface GlobalState {}

interface State extends LocalState, GlobalState {}

class IdeasNewPage2 extends React.PureComponent<Props & WithRouterProps, State> {
  localState: ILocalStateService<LocalState>;
  globalState: IGlobalStateService<IIdeasNewPageGlobalState>;
  subscriptions: Subscription[];
  projectId$: BehaviorSubject<string> = new BehaviorSubject('');

  constructor(props: Props & WithRouterProps) {
    super(props);
    const initialLocalState: LocalState = {
      showIdeaForm: true,
      locale: null,
      publishing: false
    };
    const initialGlobalState: IIdeasNewPageGlobalState = {
      title: null,
      description: null,
      selectedTopics: null,
      selectedProject: null,
      position: '',
      position_coordinates: props.location.query.position ? { type: 'Point', coordinates: JSON.parse(props.location.query.position) as number[] } : null,
      submitError: false,
      processing: false,
      ideaId: null,
      imageFile: null,
      imageId: null,
      imageChanged: false
    };
    this.state = initialLocalState;
    this.localState = localState(initialLocalState);
    this.globalState = globalState.init('IdeasNewPage', initialGlobalState);
    this.subscriptions = [];
  }

  componentDidMount() {
    const { project } = this.props;
    const localState$ = this.localState.observable;
    const locale$ = localeStream().observable;

    if (!isNilOrError(project)) {
      this.projectId$.next(project.id);
    }

    if (this.props.location.query.position) {
      reverseGeocode(JSON.parse(this.props.location.query.position)).then((position) => {
        globalState.set('IdeasNewPage', { position });
      });
    }

    this.subscriptions = [
      localState$.subscribe(({ showIdeaForm, locale, publishing }) => {
        const newState: State = { showIdeaForm, locale, publishing };
        this.setState(newState);
      }),
      locale$.subscribe(locale => this.localState.set({ locale })),
      this.projectId$.distinctUntilChanged().subscribe((projectId) => {
        globalState.set('IdeasNewPage', { selectedProject: { value: projectId } });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  componentDidUpdate() {
    const { project } = this.props;

    if (!isNilOrError(project) && isString(project.id)) {
      this.projectId$.next(project.id);
    }
  }

  async postIdea(publicationStatus: 'draft' | 'published', authorId: string | null) {
    const { locale } = await this.localState.get();
    const { title, description, selectedTopics, selectedProject, position, position_coordinates, ideaId } = await this.globalState.get();
    const ideaTitle = { [locale as string]: title as string };
    const ideaDescription = { [locale as string]: (description || '') };
    const topicIds = (selectedTopics ? selectedTopics.map(topic => topic.value) : null);
    const projectId = (selectedProject ? selectedProject.value as string : null);
    const locationGeoJSON = (isString(position) && !isEmpty(position) ? await convertToGeoJson(position) : position_coordinates || null);
    const locationDescription = (isString(position) && !isEmpty(position) ? position : null);
    const ideaObject: IIdeaAdd = {
      author_id: authorId,
      publication_status: publicationStatus,
      title_multiloc: ideaTitle,
      body_multiloc: ideaDescription,
      topic_ids: topicIds,
      project_id: projectId,
      location_point_geojson: locationGeoJSON,
      location_description: locationDescription
    };

    if (ideaId) {
      return await updateIdea(ideaId, ideaObject);
    } else {
      return await addIdea(ideaObject);
    }
  }

  async postIdeaAndIdeaImage(publicationStatus: 'draft' | 'published', authorId: string | null) {
    try {
      let ideaImage: IIdeaImage | null = null;
      const { imageId, imageChanged, imageFile } = await this.globalState.get();

      const idea = await this.postIdea(publicationStatus, authorId);

      // check if an image was previously saved and changed afterwards
      // if so, delete the old image from the server first before uploading the new one
      if (imageId && imageChanged) {
        await deleteIdeaImage(idea.data.id, imageId);
      }

      // upload the newly dropped image to the server
      if (imageChanged && imageFile && imageFile[0] && imageFile[0].base64 && isString(imageFile[0].base64)) {
        ideaImage = await addIdeaImage(idea.data.id, imageFile[0].base64 as string, 0);
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
      await this.postIdeaAndIdeaImage('published', authUser.data.id);
      browserHistory.push('/ideas');
    } catch (error) {
      if (isError(error) && error.message === 'not_authenticated') {
        try {
          await this.postIdeaAndIdeaImage('draft', null);
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
    this.localState.set({ publishing: true });
    const { ideaId } = await this.globalState.get();

    if (ideaId) {
      await updateIdea(ideaId, { author_id: userId, publication_status: 'published' });
    }

    browserHistory.push('/ideas');
  }

  render() {
    const { showIdeaForm, publishing } = this.state;

    return (
      <Container>
        <ContainerInner className={`${publishing && 'hidden'}`}>
          <TransitionGroup>
            {showIdeaForm &&
              <CSSTransition classNames="buttonbar" timeout={timeout}>
                <ButtonBarContainer>
                  <IdeasNewButtonBar onSubmit={this.handleOnIdeaSubmit} />
                </ButtonBarContainer>
              </CSSTransition>
            }

            {showIdeaForm &&
              <CSSTransition classNames="page" timeout={timeout}>
                <PageContainer className="ideaForm">
                  <NewIdeaForm onSubmit={this.handleOnIdeaSubmit} />
                </PageContainer>
              </CSSTransition>
            }

            {!showIdeaForm &&
              <CSSTransition classNames="page" timeout={timeout}>
                <PageContainer>
                  <SignInUp
                    onGoBack={this.handleOnSignInUpGoBack}
                    onSignInUpCompleted={this.handleOnSignInUpCompleted}
                  />
                </PageContainer>
              </CSSTransition>
            }
          </TransitionGroup>
        </ContainerInner>
      </Container>
    );
  }
}

export default withRouter<Props>((inputProps: Props & WithRouterProps) => (
  <GetProject slug={inputProps.params.slug}>
    {project => <IdeasNewPage2 {...inputProps} project={project} />}
  </GetProject>
));
