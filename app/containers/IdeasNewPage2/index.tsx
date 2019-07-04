import React from 'react';
import { adopt } from 'react-adopt';
import { Subscription } from 'rxjs';
import { isString, isEmpty } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// libraries
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

// components
import IdeasNewButtonBar from './IdeasNewButtonBar';
import NewIdeaForm from './NewIdeaForm';
import SignInUp from './SignInUp';

// services
import { addIdea, updateIdea, IIdeaAdd } from 'services/ideas';
import { addIdeaFile, deleteIdeaFile } from 'services/ideaFiles';
import { addIdeaImage, deleteIdeaImage } from 'services/ideaImages';
import { localState, ILocalStateService } from 'services/localState';
import { globalState, IGlobalStateService, IIdeasNewPageGlobalState } from 'services/globalState';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

// utils
import { convertToGeoJson, reverseGeocode } from 'utils/locationTools';

// style
import { media, colors } from 'utils/styleUtils';
import styled from 'styled-components';

const timeout = 600;

const Container = styled.div`
  background: ${colors.background};
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
  locale: GetLocaleChildProps;
  authUser: GetAuthUserChildProps;
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

interface LocalState {
  showIdeaForm: boolean;
  publishing: boolean;
}

interface GlobalState {}

interface State extends LocalState, GlobalState {}

class IdeasNewPage2 extends React.PureComponent<Props & WithRouterProps, State> {
  localState: ILocalStateService<LocalState>;
  globalState: IGlobalStateService<IIdeasNewPageGlobalState>;
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    const initialLocalState: LocalState = {
      showIdeaForm: true,
      publishing: false
    };
    const initialGlobalState: IIdeasNewPageGlobalState = {
      title: null,
      description: null,
      selectedTopics: null,
      budget: null,
      location: '',
      geojson_position_coordinates: null,
      submitError: false,
      processing: false,
      ideaId: null,
      ideaSlug: null,
      imageFile: [],
      imageId: null,
      imageChanged: false,
      ideaFiles: [],
      ideaFilesToRemove: []
    };
    this.state = initialLocalState;
    this.localState = localState(initialLocalState);
    this.globalState = globalState.init('IdeasNewPage', initialGlobalState);
    this.subscriptions = [];
  }

  componentDidMount() {
    const { location } = this.props;
    const localState$ = this.localState.observable;

    if (location.query.position) {
      const coordinates = JSON.parse(location.query.position);
      const lat = coordinates[0];
      const lng = coordinates[1];

      reverseGeocode(coordinates).then((location) => {
        this.globalState.set({
          // when we post an idea through the map,
          // we want to keep the original coordinates for the position on the map
          // and don't use the convertToGeoJson function
          // position (variable) is an address and will possibly be an approximation
          location,
          geojson_position_coordinates: {
            type: 'Point',
            coordinates: [lng, lat] as number[]
          }
        });
      });
    }

    this.subscriptions = [
      localState$.subscribe(({ showIdeaForm, publishing }) => {
        this.setState({ showIdeaForm, publishing });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  async postIdea(publicationStatus: 'draft' | 'published', authorId: string | null) {
    const { locale, project } = this.props;
    const { title, description, selectedTopics, budget, location, geojson_position_coordinates, ideaId } = await this.globalState.get();
    const ideaTitle = { [locale as string]: title as string };
    const ideaDescription = { [locale as string]: (description || '') };
    const topicIds = (selectedTopics ? selectedTopics.map(topic => topic.value) : null);
    const projectId = !isNilOrError(project) ? project.id : null;
    const locationGeoJSON = !geojson_position_coordinates ? await convertToGeoJson(location) : geojson_position_coordinates;
    const locationDescription = (isString(location) && !isEmpty(location) ? location : null);
    const ideaObject: IIdeaAdd = {
      budget,
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
      const { imageId, imageChanged, imageFile, ideaFiles, ideaFilesToRemove } = await this.globalState.get();
      const idea = await this.postIdea(publicationStatus, authorId);
      const imageToAddPromise = (imageChanged && imageFile && imageFile[0] ? addIdeaImage(idea.data.id, imageFile[0].base64, 0) : Promise.resolve(null));
      const filesToAddPromises = ideaFiles.filter(file => !file.remote).map(file => addIdeaFile(idea.data.id, file.base64, file.name));
      const filesToRemovePromises = ideaFilesToRemove.filter(file => !!(file.remote && file.id)).map(file => deleteIdeaFile(idea.data.id, file.id as string));

      if (imageId && imageChanged) {
        await deleteIdeaImage(idea.data.id, imageId);
      }

      const response = await Promise.all([
        imageToAddPromise,
        ...filesToAddPromises,
        ...filesToRemovePromises
      ] as Promise<any>[]);

      const ideaImage = response[0];

      this.globalState.set({
        ideaId: idea.data.id,
        ideaSlug: idea.data.attributes.slug,
        imageId: (ideaImage ? ideaImage.data.id : null),
        imageChanged: false
      });

      return idea;
    } catch (error) {
      throw 'error';
    }
  }

  handleOnIdeaSubmit = async () => {
    const { authUser } = this.props;

    this.globalState.set({ submitError: false, processing: true });

    if (!isNilOrError(authUser)) {
      try {
        const newIdea = await this.postIdeaAndIdeaImage('published', authUser.id);

        clHistory.push({
          pathname: `/ideas/${newIdea.data.attributes.slug}`,
          search: `?new_idea_id=${newIdea.data.id}&new_idea_slug=${newIdea.data.attributes.slug}&publish=false`
        });
      } catch (error) {
        this.globalState.set({ processing: false, submitError: true });
      }
    } else {
      try {
        await this.postIdeaAndIdeaImage('draft', null);
        this.globalState.set({ processing: false, submitError: false });
        this.localState.set({ showIdeaForm: false });
        window.scrollTo(0, 0);
      } catch (error) {
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
      const idea = await updateIdea(ideaId, { author_id: userId, publication_status: 'published' });

      if (idea) {
        clHistory.push({
          pathname: `/ideas/${idea.data.attributes.slug}`,
          search: `?new_idea_id=${idea.data.id}&new_idea_slug=${idea.data.attributes.slug}&publish=false`
        });
      }
    }
  }

  render() {
    const { showIdeaForm, publishing } = this.state;
    const { project } = this.props;

    if (isNilOrError(project)) return null;

    return (
      <Container className="e2e-idea-form-page">
        <ContainerInner className={`${publishing && 'hidden'}`}>
          <TransitionGroup>

            {showIdeaForm &&
              <CSSTransition classNames="page" timeout={timeout}>
                <PageContainer className="ideaForm">
                  <NewIdeaForm onSubmit={this.handleOnIdeaSubmit} projectId={project.id} />
                </PageContainer>
              </CSSTransition>
            }

            {showIdeaForm &&
              <CSSTransition classNames="buttonbar" timeout={timeout}>
                <ButtonBarContainer>
                  <IdeasNewButtonBar form="idea-form" onSubmit={this.handleOnIdeaSubmit} />
                </ButtonBarContainer>
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

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  locale: <GetLocale />,
  authUser: <GetAuthUser />,
  project: ({ params, render }) => <GetProject slug={params.slug}>{render}</GetProject>
});

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeasNewPage2 {...inputProps} {...dataProps} />}
  </Data>
));
