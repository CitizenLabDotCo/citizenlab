import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import scrollToComponent from 'react-scroll-to-component';
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { ImageFile } from 'react-dropzone';
import { IOption } from 'typings';

// components
import Select from 'components/UI/Select';
import MultipleSelect from 'components/UI/MultipleSelect';
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import LocationInput from 'components/UI/LocationInput';
import Editor from 'components/UI/Editor';
import Button from 'components/UI/Button';
import Upload, { ExtendedImageFile } from 'components/UI/Upload';
import Error from 'components/UI/Error';

// services
import { localeStream } from 'services/locale';
import { topicsStream, ITopics, ITopicData } from 'services/topics';
import { projectsStream, IProjects, IProjectData } from 'services/projects';
import { addIdea } from 'services/ideas';
import { addIdeaImage } from 'services/ideaImages';
import { authUserStream } from 'services/auth';
import { IUser } from 'services/users';

// utils
import eventEmitter from 'utils/eventEmitter';

// i18n
import { injectIntl, InjectedIntlProps } from 'react-intl';
import messages from './messages';

// style
import { media } from 'utils/styleUtils';
import styled from 'styled-components';

const Container = styled.div``;

const Form = styled.div`
  width: 100%;
  max-width: 600px;
  display: 'flex';
  flex-direction: column;
  align-items: center;
  padding-bottom: 100px;
  padding-right: 30px;
  padding-left: 30px;
  margin-left: auto;
  margin-right: auto;
`;

const Title = styled.h2`
  width: 100%;
  color: #333;
  font-size: 36px;
  line-height: 42px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 40px;
`;

const FormElement = styled.div`
  width: 100%;
  margin-bottom: 40px;
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

type Props = {};

type State = {
  locale: string | null;
  authUser: IUser | null;
  topics: IOption[] | null;
  projects: IOption[] | null;
  title: string | null;
  description: EditorState;
  selectedTopics: IOption[] | null;
  selectedProject: IOption | null;
  location: any;
  images: ExtendedImageFile[] | null;
  titleError: string | null;
  descriptionError: string | null;
  submitError: boolean;
  processing: boolean;
};

class IdeaForm extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  titleInputElement: HTMLInputElement | null;
  descriptionElement: any | null;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      locale: null,
      authUser: null,
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
    this.titleInputElement = null;
    this.descriptionElement = null;
    this.subscriptions = [];
  }

  componentWillMount() {
    const locale$ = localeStream().observable;
    const authUser$ = authUserStream().observable;
    const topics$ = topicsStream().observable;
    const projects$ = projectsStream().observable;

    this.subscriptions = [
      eventEmitter.observe(ButtonBarNamespace, 'submit').subscribe(this.handleOnSubmit),

      Rx.Observable.combineLatest(
        locale$,
        authUser$,
        topics$,
        projects$
      ).subscribe(([locale, authUser, topics, projects]) => {
        this.setState({
          locale,
          authUser,
          topics: this.getOptions(topics),
          projects: this.getOptions(projects)
        });
      })
    ];
  }

  componentDidMount() {
    this.titleInputElement && this.titleInputElement.focus();
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getOptions = (list: ITopics | IProjects | null) => {
    const { locale }  = this.state ;

    if (list && locale) {
      return (list.data as (ITopicData | IProjectData)[]).map(item => ({
        value: item.id,
        label: item.attributes.title_multiloc[locale]
      } as IOption));
    }

    return null;
  }

  handleTitleOnChange = (title: string) => {
    this.setState({ title, titleError: null });
  }

  handleDescriptionOnChange = async (description: EditorState) => {
    const descriptionError = (description.getCurrentContent().hasText() ? null : this.state.descriptionError);
    this.setState({ description, descriptionError });
  }

  handleTopicsOnChange = (selectedTopics: IOption[]) => {
    this.setState({ selectedTopics });
  }

  handleProjectOnChange = (selectedProject: IOption) => {
    this.setState({ selectedProject });
  }

  handleLocationOnChange = (location: string) => {
    this.setState({ location });
  }

  generateImagePreview(image: ImageFile) {
    if (image.type && (image.type === 'image/jpeg' || image.type === 'image/jpg' || image.type === 'image/png' || image.type === 'image/gif')) {
      const blob = new Blob([image], { type: image.type });
      return window.URL.createObjectURL(blob);
    }

    return undefined;
  }

  handleUploadOnAdd = (newImage: ImageFile) => {
    let images: ExtendedImageFile[] | null = null;
    const image = newImage as ExtendedImageFile;
    image.preview = this.generateImagePreview(newImage);

    if (this.state.images && this.state.images.length > 0) {
      images = this.state.images.concat(image);
    } else {
      images = [image];
    }

    this.setState({ images });
  }

  handleUploadOnRemove = (removedImage: ImageFile) => {
    const images = _(this.state.images).filter(image => image.preview !== removedImage.preview).value();
    this.setState({ images });

    if (removedImage.preview) {
      window.URL.revokeObjectURL(removedImage.preview);
    }
  }

  handleTitleInputSetRef = (element: HTMLInputElement) => {
    this.titleInputElement = element;
  }

  handleDescriptionInputSetRef = (element) => {
    this.descriptionElement = element;
  }

  validate = (title: string | null, description: EditorState) => {
    const { formatMessage } = this.props.intl;
    const titleError = (!title ? formatMessage(messages.titleEmptyError) : null);
    const hasDescriptionError = (!description || !description.getCurrentContent().hasText());
    const descriptionError = (hasDescriptionError ? formatMessage(messages.descriptionEmptyError) : null);

    this.setState({ titleError, descriptionError });

    if (titleError) {
      scrollToComponent(this.titleInputElement, { align:'top', offset: -240, duration: 300 });
      setTimeout(() => this.titleInputElement && this.titleInputElement.focus(), 300);
    } else if (descriptionError) {
      scrollToComponent(this.descriptionElement.editor.refs.editor, { align:'top', offset: -200, duration: 300 });
      setTimeout(() => this.descriptionElement && this.descriptionElement.focusEditor(), 300);
    }

    return (!titleError && !descriptionError);
  }

  async convertToGeoJson(location: string) {
    const results = await geocodeByAddress(location);
    const { lat, lng } = await getLatLng(results[0]);
    return {
      type: 'Point',
      coordinates: [lat, lng]
    };
  }

  async getBase64(image: ImageFile) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: any) => resolve(event.target.result);
      reader.onerror = (error) => reject(new Error(`error for getBase64() of component IdeasNewPage2`));
      reader.readAsDataURL(image);
    });
  }

  async postIdea(newIdeaFormState: INewIdeaFormState, userId: string) {
    const { locale } = this.state;

    if (locale) {
      const { topics, projects, title, description, selectedTopics, selectedProject, location } = newIdeaFormState;
      const ideaTitle = { [locale]: title as string };
      const ideaDescription = { [locale]: draftToHtml(convertToRaw(description.getCurrentContent())) };
      const topicIds = (selectedTopics ? selectedTopics.map(topic => topic.value) : null);
      const projectId = (selectedProject ? selectedProject.value : null);
      const locationGeoJSON = (_.isString(location) && !_.isEmpty(location) ? await this.convertToGeoJson(location) : null);
      const locationDescription = (_.isString(location) && !_.isEmpty(location) ? location : null);
      return await addIdea(userId, 'published', ideaTitle, ideaDescription, topicIds, projectId, locationGeoJSON, locationDescription);
    }

    throw 'locale is not defined';
  }

  async postIdeaImage(ideaId: string, image: ExtendedImageFile) {
    try {
      const base64Image = await this.getBase64(image);
      return await addIdeaImage(ideaId, base64Image, 0);
    } catch (error) {
      return error;
    }
  }

  async postIdeaAndIdeaImage(currentUserId: string) {
    try {
      const currentNewIdeaFormState = await this.newIdeaFormState$.getCurrent();
      const { images } = currentNewIdeaFormState;
      const idea = await this.postIdea(currentNewIdeaFormState, currentUserId);
      images && images.length > 0 && await this.postIdeaImage(idea.data.id, images[0]);
      return idea;
    } catch (error) {
      throw 'error';
    }
  }

  handleOnSubmit = () => {
    const { title, description } = this.state;

    if (this.validate(title, description)) {
      // submit
    }
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { topics, projects, title, description, selectedTopics, selectedProject, location, images, titleError, descriptionError, submitError, processing } = this.state;
    const submitErrorMessage = (submitError ? formatMessage(messages.submitError) : null);

    return (
      <Container>
        <Form>
          <Title>{formatMessage(messages.formTitle)}</Title>

          <FormElement name="titleInput">
            <Label value={formatMessage(messages.titleLabel)} htmlFor="title" />
            <Input
              id="title"
              type="text"
              value={title}
              placeholder={formatMessage(messages.titlePlaceholder)}
              error={titleError}
              onChange={this.handleTitleOnChange}
              setRef={this.handleTitleInputSetRef}
            />
          </FormElement>

          <FormElement name="descriptionInput">
            <Label value={formatMessage(messages.descriptionLabel)} htmlFor="editor" />
            <Editor
              id="editor"
              value={description}
              placeholder={formatMessage(messages.descriptionPlaceholder)}
              error={descriptionError}
              onChange={this.handleDescriptionOnChange}
              setRef={this.handleDescriptionInputSetRef}
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
              items={images}
              accept="image/jpg, image/jpeg, image/png, image/gif"
              maxSize={5000000}
              maxItems={1}
              placeholder={formatMessage(messages.imageUploadPlaceholder)}
              disablePreview={true}
              destroyPreview={false}
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
            />
            <Error text={submitErrorMessage} marginTop="0px" />
          </MobileButton>
        </Form>
      </Container>
    );
  }
}

export default injectIntl<Props>(IdeaForm);
