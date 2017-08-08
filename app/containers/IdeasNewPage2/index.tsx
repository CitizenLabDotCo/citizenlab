import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
// import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import shallowCompare from 'utils/shallowCompare';
import { media } from 'utils/styleUtils';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { injectIntl, intlShape } from 'react-intl';
import { browserHistory } from 'react-router';
import { injectTFunc } from 'utils/containers/t/utils';
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import Select from 'components/UI/Select';
import MultipleSelect from 'components/UI/MultipleSelect';
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import LocationInput from 'components/UI/LocationInput';
import Editor from 'components/UI/Editor';
import { EditorState, convertToRaw } from 'draft-js';
import Button from 'components/UI/Button';
import Upload from 'components/UI/Upload';
// import Icon from 'components/UI/Icon';
import { ImageFile } from 'react-dropzone';
import Error from 'components/UI/Error';
import SignIn from 'containers/SignIn';
import SignUp from 'containers/SignUp';
import draftToHtml from 'draftjs-to-html';
import { IOption } from 'typings';
import { IUser } from 'services/users';
import { addIdea } from 'services/ideas';
import { addIdeaImage } from 'services/ideaImages';
import { IStream } from 'utils/streams';
import { stateStream, IStateStream } from 'services/state';
import { observeTopics, ITopics, ITopicData } from 'services/topics';
import { observeProjects, IProjects, IProjectData } from 'services/projects';
import { observeCurrentUser, getAuthUser } from 'services/auth';
import { makeSelectLocale } from '../LanguageProvider/selectors';
import messages from './messages';
import styled from 'styled-components';

const FormContainer = styled.div`
  width: 100%;
  min-height: calc(100vh - 65px);
  padding-top: 40px;
  padding-bottom: 100px;
  background: #f4f4f4;
  position: relative;
  will-change: auto;

  &.form-enter {
    opacity: 0.01;
    position: absolute;
    will-change: opacity;

    &.form-enter-active {
      opacity: 1;
      transition: all 2500ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }

  &.form-leave {
    opacity: 1;
    will-change: opacity;

    &.form-leave-active {
      opacity: 0.01;
      transition: all 2500ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }
`;

const Form = styled.div`
  width: 100%;
  max-width: 600px;
  display: 'flex';
  flex-direction: column;
  align-items: center;
  padding-right: 30px;
  padding-left: 30px;
  margin-left: auto;
  margin-right: auto;
`;

const Title = styled.h2`
  width: 100%;
  color: #333;
  font-size: 36px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 40px;
`;

const FormElement = styled.div`
  width: 100%;
  margin-bottom: 35px;
`;

const MobileButton = styled.div`
  width: 100%;
  display: flex;

  .Button {
    margin-right: 10px;
  }

  .Error {
    flex: 1;
  }

  ${media.notPhone`
    display: none;
  `}
`;

const ButtonBar = styled.div`
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  position: fixed;
  z-index: 99999;
  bottom: 0;
  left: 0;
  right: 0;
  box-shadow: 0 -1px 1px 0 rgba(0, 0, 0, 0.1);

  ${media.phone`
    display: none;
  `}
`;

const ButtonBarInner = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  align-items: center;
  padding-right: 30px;
  padding-left: 30px;

  .Button {
    margin-right: 10px;
  }

  .Error {
    flex: 1;
  }
`;

interface ExtendedImageFile extends ImageFile {
  base64: string;
}

type Props = {
  intl: ReactIntl.InjectedIntl,
  tFunc: Function,
  locale: string,
};

type State = {
  topics: IOption[] | null;
  projects: IOption[] | null;
  title: string | null;
  description: EditorState;
  selectedTopics: IOption[] | null;
  selectedProject: IOption | null;
  location: any;
  images: ExtendedImageFile[] | null;
  processing: boolean;
  showIdeaForm: boolean;
  showSignInForm: boolean;
  showSignUpForm: boolean;
  titleError: string | null;
  descriptionError: string | null;
  submitError: string | null;
};

interface IState {
  topics?: IOption[] | null;
  projects?: IOption[] | null;
  title?: string | null;
  description?: EditorState;
  selectedTopics?: IOption[] | null;
  selectedProject?: IOption | null;
  location?: any;
  images?: ExtendedImageFile[] | null;
  processing?: boolean;
  showIdeaForm?: boolean;
  showSignInForm?: boolean;
  showSignUpForm?: boolean;
  titleError?: string | null;
  descriptionError?: string | null;
  submitError?: string | null;
}

class IdeasNewPage2 extends React.PureComponent<Props, State> {
  state$: IStateStream<IState>;
  topics$: IStream<ITopics>;
  projects$: IStream<IProjects>;
  user$: IStream<IUser>;
  subscriptions: Rx.Subscription[];
  titleInputElement: HTMLInputElement | null;

  constructor() {
    super();
    this.state = {
      topics: null,
      projects: null,
      title: null,
      description: EditorState.createEmpty(),
      selectedTopics: null,
      selectedProject: null,
      location: null,
      images: null,
      processing: false,
      showIdeaForm: true,
      showSignInForm: false,
      showSignUpForm: false,
      titleError: null,
      descriptionError: null,
      submitError: null
    };
    this.state$ = stateStream.observe<IState>('IdeasNewPage', this.state);
    this.topics$ = observeTopics();
    this.projects$ = observeProjects();
    this.user$ = observeCurrentUser();
    this.subscriptions = [];
    this.titleInputElement = null;
  }

  async componentDidMount() {
    this.subscriptions = [
      this.state$.observable.subscribe(state => this.setState(state as State)),

      Rx.Observable.combineLatest(
        this.topics$.observable.distinctUntilChanged(),
        this.projects$.observable.distinctUntilChanged(),
        (topics, projects) => ({ topics, projects })
      ).subscribe(({ topics, projects }) => {
        this.state$.next({
          topics: (topics ? this.getOptions(topics) : null),
          projects: (projects ? this.getOptions(projects) : null)
        });
      }),
    ];

    // autofocus the title input field on initial render;
    if (this.titleInputElement !== null) {
      this.titleInputElement.focus();
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getOptions(list: ITopics | IProjects) {
    return (list.data as (ITopicData | IProjectData)[]).map(item => ({
      value: item.id,
      label: this.props.tFunc(item.attributes.title_multiloc) as string,
    } as IOption));
  }

  async getBase64(image: ImageFile) {
    return new Promise<Promise<string>>((resolve) => {
      const reader = new FileReader();
      reader.onload = (event: any) => resolve(event.target.result);
      reader.readAsDataURL(image);
    });
  }

  async convertToGeoJson(location: string) {
    const results = await geocodeByAddress(location);
    const { lat, lng } = await getLatLng(results[0]);
    const geoJSON = {
      type: 'Point',
      coordinates: [lat, lng]
    };

    return geoJSON;
  }

  handleTitleOnChange = (title: string) => {
    this.state$.next({
      title,
      titleError: null
    });
  }

  handleDescriptionOnChange = (description: EditorState) => {
    this.state$.next((state) => {
      const descriptionError = (description.getCurrentContent().hasText() ? null : state.descriptionError);
      return { description, descriptionError };
    });
  }

  handleTopicsOnChange = (selectedTopics: IOption[]) => {
    this.state$.next({ selectedTopics });
  }

  handleProjectOnChange = (selectedProject: IOption) => {
    this.state$.next({ selectedProject });
  }

  handleLocationOnChange = (location: string) => {
    this.state$.next({ location });
  }

  handleUploadOnAdd = async (image: ImageFile) => {
    const base64 = await this.getBase64(image);

    this.state$.next((state) => {
      const newImage: ExtendedImageFile = { ...image, base64 };
      const images: ExtendedImageFile[] = (state.images ? [...state.images, newImage] : [newImage]);
      return { images };
    });
  }

  handleUploadOnRemove = (removedImage) => {
    this.state$.next((state) => {
      const images = _(state.images).filter((image) => image.preview !== removedImage.preview).value();
      return { images };
    });
  }

  handleSetRef = (element: HTMLInputElement) => {
    this.titleInputElement = element;
  }

  handleOnSubmit = async () => {
    const { locale } = this.props;
    const { formatMessage } = this.props.intl;
    const { title, description, selectedTopics, selectedProject, location, images } = this.state;
    const titleError = (!title ? formatMessage(messages.titleEmptyError) : null);
    const hasDescriptionError = (!description || !description.getCurrentContent().hasText());
    const descriptionError = (hasDescriptionError ? formatMessage(messages.descriptionEmptyError) : null);
    this.state$.next({ titleError, descriptionError });

    if (!titleError && !descriptionError && title) {
      try {
        this.state$.next({ processing: true });
        const authUser = await getAuthUser();
        const userId = authUser.data.id;
        const ideaTitle = { [locale]: title };
        const ideaDescription = { [locale]: draftToHtml(convertToRaw(description.getCurrentContent())) };
        const topicIds = (selectedTopics ? selectedTopics.map(topic => topic.value) : null);
        const projectId = (selectedProject ? selectedProject.value : null);
        const locationGeoJSON = (_.isString(location) && !_.isEmpty(location) ? await this.convertToGeoJson(location) : null);
        const locationDescription = (_.isString(location) && !_.isEmpty(location) ? location : null);

        console.log('userId: ' + userId);
        console.log('ideaTitle:');
        console.log(ideaTitle);
        console.log('ideaDescription:');
        console.log(ideaDescription);
        console.log('topicIds:');
        console.log(topicIds);
        console.log('projectId:');
        console.log(projectId);
        console.log('locationGeoJSON:');
        console.log(locationGeoJSON);
        console.log('locationDescription: ' + locationDescription);
        console.log('images:');
        console.log(images);

        // const idea = await addIdea(userId, 'published', ideaTitle, ideaDescription, topicIds, projectId, locationGeoJSON, locationDescription);
        // await Promise.all(_(images).map((image, index) => addIdeaImage(idea.data.id, image.base64, index)).value());
        // this.state$.next({ processing: false });
      } catch (error) {
        if (_.isError(error) && error.message === 'not authenticated') {
          window.scrollTo(0, 0);
          this.state$.next({
            processing: false,
            showIdeaForm: false,
            showSignInForm: true,
            showSignUpForm: false
          });
        }
      }
    }
  }

  handleGoBack = () => {
    console.log('go back');
    window.scrollTo(0, 0);
    this.state$.next({
      showIdeaForm: true,
      showSignInForm: false,
      showSignUpForm: false
    });
  }

  handleCreateAccount = () => {
    window.scrollTo(0, 0);
    this.state$.next({
      showIdeaForm: false,
      showSignInForm: false,
      showSignUpForm: true
    });
  }

  handleOnSignedIn = () => {
    console.log('signed in');
    browserHistory.push('/ideas');
  }

  handleOnSignedUp = () => {
    console.log('signed up');
    browserHistory.push('/ideas');
  }

  render() {
    const {
      topics,
      projects,
      title,
      titleError,
      description,
      descriptionError,
      submitError,
      selectedTopics,
      selectedProject,
      location,
      images,
      processing,
      showIdeaForm,
      showSignInForm,
      showSignUpForm
    } = this.state;
    const { formatMessage } = this.props.intl;
    const uploadedImages = _(images).map((image) => _.omit(image, 'base64') as ImageFile).value();
    const hasAllRequiredContent = title && description && description.getCurrentContent().hasText();

    const ideaForm = (
      <FormContainer>
        <Form>
          <Title>{formatMessage(messages.formTitle)}</Title>

          <FormElement>
            <Label value={formatMessage(messages.titleLabel)} htmlFor="title" />
            <Input
              id="title"
              type="text"
              value={title}
              placeholder={formatMessage(messages.titlePlaceholder)}
              error={titleError}
              onChange={this.handleTitleOnChange}
              setRef={this.handleSetRef}
            />
          </FormElement>

          <FormElement>
            <Label value={formatMessage(messages.descriptionLabel)} htmlFor="editor" />
            <Editor
              id="editor"
              value={description}
              placeholder={formatMessage(messages.descriptionPlaceholder)}
              error={descriptionError}
              onChange={this.handleDescriptionOnChange}
            />
          </FormElement>

          <FormElement>
            <Label value={formatMessage(messages.topicsLabel)} htmlFor="topics" />
            <MultipleSelect
              value={selectedTopics}
              placeholder={formatMessage(messages.topicsPlaceholder)}
              options={topics}
              max={2}
              onChange={this.handleTopicsOnChange}
            />
          </FormElement>

          <FormElement>
            <Label value={formatMessage(messages.projectsLabel)} htmlFor="projects" />
            <Select
              value={selectedProject}
              placeholder={formatMessage(messages.projectsPlaceholder)}
              options={projects}
              onChange={this.handleProjectOnChange}
            />
          </FormElement>

          <FormElement>
            <Label value={formatMessage(messages.locationLabel)} htmlFor="location" />
            <LocationInput
              id="location"
              value={location}
              placeholder={formatMessage(messages.locationPlaceholder)}
              onChange={this.handleLocationOnChange}
            />
          </FormElement>

          <FormElement>
            <Label value={formatMessage(messages.imageUploadLabel)} />
            <Upload
              intl={this.props.intl}
              items={uploadedImages}
              accept="image/jpg, image/jpeg, image/png, image/gif"
              maxSize={2500000}
              maxItems={1}
              placeholder={formatMessage(messages.imageUploadPlaceholder)}
              onAdd={this.handleUploadOnAdd}
              onRemove={this.handleUploadOnRemove}
            />
          </FormElement>

          <MobileButton>
            <Button
              size="2"
              loading={processing}
              text={formatMessage(messages.submit)}
              onClick={this.handleOnSubmit}
              disabled={!hasAllRequiredContent}
            />
            <Error text={submitError} marginTop="0px" />
          </MobileButton>
        </Form>
      </FormContainer>
    );

    const signInForm = (
      <FormContainer>
        <Form>
          <Button
            size="2"
            style="secondary"
            text={formatMessage(messages.goBack)}
            onClick={this.handleGoBack}
            icon="arrow-back"
          />

          <Title>{formatMessage(messages.signInTitle)}</Title>

          <SignIn
            onSignedIn={this.handleOnSignedIn}
            intl={this.props.intl}
            locale={this.props.locale}
          />

          <div>-Or-</div>

          <div>
            <Button
              size="2"
              style="secondary"
              text={formatMessage(messages.createAnAccount)}
              onClick={this.handleCreateAccount}
              icon="arrow-back"
            />
          </div>
        </Form>
      </FormContainer>
    );

    const signUpForm = (
      <FormContainer>
        <Form>
          <Button
            size="2"
            style="secondary"
            text={formatMessage(messages.goBack)}
            onClick={this.handleGoBack}
            icon="arrow-back"
          />

          <Title>{formatMessage(messages.signUpTitle)}</Title>

          <SignUp
            onSignedUp={this.handleOnSignedUp}
            intl={this.props.intl}
            tFunc={this.props.tFunc}
            locale={this.props.locale}
          />
        </Form>
      </FormContainer>
    );

    const bottomButtonBar = (
      <ButtonBar>
        <ButtonBarInner>
          <Button
            size="2"
            loading={processing}
            text={formatMessage(messages.submit)}
            onClick={this.handleOnSubmit}
            disabled={!hasAllRequiredContent}
          />
          <Error text={submitError} marginTop="0px" />
        </ButtonBarInner>
      </ButtonBar>
    );

    return (
      <div>
        {/* <CSSTransitionGroup
          transitionName="form"
          transitionEnterTimeout={2500}
          transitionLeaveTimeout={2500}
        >
          {showIdeaForm && ideaForm}
          {showSignInForm && signInForm}
          {showSignUpForm && signUpForm}
        </CSSTransitionGroup> */}

        {showIdeaForm && bottomButtonBar}
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  locale: makeSelectLocale(),
});

export default injectTFunc(injectIntl(connect(mapStateToProps, null)(IdeasNewPage2)));
