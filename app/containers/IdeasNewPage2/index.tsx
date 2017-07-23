import * as React from 'react';
import { media } from 'utils/styleUtils';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { injectIntl, intlShape } from 'react-intl';
// import { browserHistory } from 'react-router';
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
import { ImageFile } from 'react-dropzone';
import Error from 'components/UI/Error';
import SignIn from 'containers/SignIn';
import SignUp from 'containers/SignUp';
import * as draftToHtml from 'draftjs-to-html';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import { IOption } from 'typings';
import { IUser } from 'services/users';
import { IStream } from 'utils/streams';
import { observeTopics, ITopics, ITopicData } from 'services/topics';
import { observeProjects, IProjects, IProjectData } from 'services/projects';
import { observeSignedInUser } from 'services/auth';
import { makeSelectLocale } from '../LanguageProvider/selectors';
import messages from './messages';
import styledComponents from 'styled-components';
const styled = styledComponents;

const Container = styled.div`
  background: #f2f2f2;
`;

const FormContainerOuter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 40px;
  padding-bottom: 100px;
`;

const Title = styled.h2`
  color: #333;
  font-size: 36px;
  font-weight: 500;
  margin-bottom: 40px;
`;

const FormContainerInner = styled.div`
  width: 100%;
  max-width: 550px;
`;

const FormElement = styled.div`
  width: 100%;
  margin-bottom: 44px;
`;

const EditorWrapper = styled.div`
  margin-bottom: 44px;
`;

const MobileButton = styled.div`
  width: 100%;
  max-width: 550px;
  display: flex;
  align-items: center;

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
  padding-left: 30px;
  padding-right: 30px;
  position: fixed;
  z-index: 99999;
  bottom: 0px;
  box-shadow: 0 -3px 3px 0 rgba(0, 0, 0, 0.05);

  ${media.phone`
    display: none;
  `}
`;

const ButtonBarInner = styled.div`
  width: 100%;
  max-width: 550px;
  display: flex;
  align-items: center;

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
  user: IUser | null;
  topics: IOption[] | null;
  projects: IOption[] | null;
  title: string | null;
  description: EditorState;
  selectedTopics: IOption[] | null;
  selectedProject: IOption | null;
  location: any;
  images: ExtendedImageFile[] | null;
  processing: boolean;
  titleError: string | null;
  descriptionError: string | null;
  submitError: string | null;
};

interface IState {
  user?: IUser | null;
  topics?: IOption[] | null;
  projects?: IOption[] | null;
  title?: string | null;
  description?: EditorState;
  selectedTopics?: IOption[] | null;
  selectedProject?: IOption | null;
  location?: any;
  images?: ExtendedImageFile[] | null;
  processing?: boolean;
  titleError?: string | null;
  descriptionError?: string | null;
  submitError?: string | null;
}

class IdeasNewPage2 extends React.PureComponent<Props, State> {
  state$: Rx.Subject<IState>;
  topics$: IStream<ITopics>;
  projects$: IStream<IProjects>;
  user$: IStream<IUser>;
  subscriptions: Rx.Subscription[];
  titleInputElement: HTMLInputElement | null;

  constructor() {
    super();
    this.state = {
      user: null,
      topics: null,
      projects: null,
      title: null,
      description: EditorState.createEmpty(),
      selectedTopics: null,
      selectedProject: null,
      location: null,
      images: null,
      processing: false,
      titleError: null,
      descriptionError: null,
      submitError: null
    };
    this.state$ = new Rx.Subject();
    this.topics$ = observeTopics();
    this.projects$ = observeProjects();
    this.user$ = observeSignedInUser();
    this.subscriptions = [];
    this.titleInputElement = null;
  }

  componentDidMount() {
    this.subscriptions = [
      this.state$
        .startWith(this.state)
        .scan((prevState, updatedStateProps) => ({ ...prevState, ...updatedStateProps }))
        .subscribe(state => this.setState(state as State)),

      Rx.Observable.combineLatest(
        this.topics$.observable.distinctUntilChanged(),
        this.projects$.observable.distinctUntilChanged(),
        this.user$.observable.distinctUntilChanged(),
        (topics, projects, user) => ({ topics, projects, user }),
      ).subscribe(({ topics, projects, user }) => {
        this.state$.next({
          user: (!_.isError(user) ? user : null),
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
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  getOptions(list: ITopics | IProjects) {
    const { tFunc } = this.props;

    return (list.data as (ITopicData | IProjectData)[]).map(item => ({
      value: item.id,
      label: tFunc(item.attributes.title_multiloc) as string,
    } as IOption));
  }

  async getBase64(image: ImageFile) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event: any) => resolve(event.target.result);
      reader.readAsDataURL(image);
    });
  }

  async convertToLatLng(location: string) {
    const results = await geocodeByAddress(location);
    return getLatLng(results[0]);
  }

  handleTitleOnChange = (title: string) => {
    this.state$.next({ title, titleError: null });
  }

  handleDescriptionOnChange = (description: EditorState) => {
    this.state$.next({
      description,
      descriptionError: (description.getCurrentContent().hasText() ? null : this.state.descriptionError),
    });
  }

  handleTopicsOnChange = (selectedTopics) => {
    this.state$.next({ selectedTopics });
  }

  handleProjectOnChange = (selectedProject) => {
    this.state$.next({ selectedProject });
  }

  handleLocationOnChange = (location) => {
    this.state$.next({ location });
  }

  handleUploadOnAdd = async (image: ImageFile) => {
    const base64 = await this.getBase64(image) as string;
    const newImage: ExtendedImageFile = { ...image, base64 };
    const images: ExtendedImageFile[] = (this.state.images ? [...this.state.images, newImage] : [newImage]);
    this.state$.next({ images });
  }

  handleUploadOnRemove = (removedImage) => {
    const images = _(this.state.images).filter((image) => image.preview !== removedImage.preview).value();
    this.state$.next({ images });
  }

  handleSetRef = (element: HTMLInputElement) => {
    this.titleInputElement = element;
  }

  handleOnSubmit = async () => {
    const { locale } = this.props;
    const { formatMessage } = this.props.intl;
    const { user, title, description, selectedTopics, selectedProject, location, images } = this.state;

    if (!title || !description || !description.getCurrentContent().hasText()) {
      const titleError = (!title ? formatMessage(messages.titleEmptyError) : null);
      const descriptionError = (!description || !description.getCurrentContent().hasText() 
                                ? formatMessage(messages.descriptionEmptyError) 
                                : null);

      this.setState({ titleError, descriptionError });
    } else {
      const localTitle = { [locale]: title };
      const localDescription = { [locale]: draftToHtml(convertToRaw(description.getCurrentContent())) };
      const latLng = (location ? await this.convertToLatLng(location) : null);

      console.log(user);
      console.log(localTitle);
      console.log(localDescription);
      console.log(selectedTopics);
      console.log(latLng);
      console.log(selectedProject);
      console.log(images);

      // this.props.submitIdea(user.id, localTitle, localDescription, topics, location, project, 'published');
    }
  }

  handleOnSignedIn = () => {
    console.log('signed in');
    // browserHistory.push('/ideas');
  }

  handleOnSignedUp = () => {
    console.log('signed up');
    // browserHistory.push('/ideas');
  }

  render() {
    const { topics, projects } = this.state;
    const { formatMessage } = this.props.intl;
    const {
      title,
      titleError,
      description,
      descriptionError,
      submitError,
      selectedTopics,
      selectedProject,
      location,
      images,
    } = this.state;
    const uploadedImages = _(images).map((image) => _.omit(image, 'base64') as ImageFile).value();
    const hasAllRequiredContent = title && description && description.getCurrentContent().hasText();

    return (
      <div>
        <Container>
          <FormContainerOuter>
            <Title>{formatMessage(messages.formTitle)}</Title>

            <FormContainerInner>
              <Label value={formatMessage(messages.titleLabel)} htmlFor="title" />
              <FormElement>
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

              <Label value={formatMessage(messages.descriptionLabel)} htmlFor="editor" />
              <EditorWrapper>
                <Editor
                  id="editor"
                  value={description}
                  placeholder={formatMessage(messages.descriptionPlaceholder)}
                  error={descriptionError}
                  onChange={this.handleDescriptionOnChange}
                />
              </EditorWrapper>

              <Label value={formatMessage(messages.topicsLabel)} htmlFor="topics" />
              <FormElement>
                <MultipleSelect
                  value={selectedTopics}
                  placeholder={formatMessage(messages.topicsPlaceholder)}
                  options={topics}
                  max={2}
                  onChange={this.handleTopicsOnChange}
                />
              </FormElement>

              <Label value={formatMessage(messages.projectsLabel)} htmlFor="projects" />
              <FormElement>
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
                  maxSize={5000000}
                  maxItems={1}
                  placeholder={formatMessage(messages.imageUploadPlaceholder)}
                  onAdd={this.handleUploadOnAdd}
                  onRemove={this.handleUploadOnRemove}
                />
              </FormElement>
              <MobileButton>
                <Button
                  size="2"
                  loading={false}
                  text={formatMessage(messages.submit)}
                  onClick={this.handleOnSubmit}
                  disabled={!hasAllRequiredContent}
                />
                <Error text={submitError} marginTop="0px" />
              </MobileButton>
            </FormContainerInner>
          </FormContainerOuter>
          <ButtonBar>
            <ButtonBarInner>
              <Button
                size="2"
                loading={false}
                text={formatMessage(messages.submit)}
                onClick={this.handleOnSubmit}
                disabled={!hasAllRequiredContent}
              />
              <Error text={submitError} marginTop="0px" />
            </ButtonBarInner>
          </ButtonBar>
        </Container>

        <SignIn
          opened={true}
          onSignedIn={this.handleOnSignedIn}
          intl={this.props.intl}
          locale={this.props.locale}
        />

        <SignUp
          opened={true}
          onSignedUp={this.handleOnSignedUp}
          intl={this.props.intl}
          tFunc={this.props.tFunc}
          locale={this.props.locale}
        />
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  locale: makeSelectLocale(),
});

export default injectTFunc(injectIntl(connect(mapStateToProps, null)(IdeasNewPage2)));
