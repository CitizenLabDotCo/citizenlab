import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import scrollToComponent from 'react-scroll-to-component';
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import { ImageFile } from 'react-dropzone';
import { media } from 'utils/styleUtils';
import Select from 'components/UI/Select';
import MultipleSelect from 'components/UI/MultipleSelect';
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import LocationInput from 'components/UI/LocationInput';
import Editor from 'components/UI/Editor';
import { EditorState, convertToRaw } from 'draft-js';
import Button from 'components/UI/Button';
import Upload, { ExtendedImageFile } from 'components/UI/Upload';
import Error from 'components/UI/Error';
import { IOption } from 'typings';
import { IStream } from 'utils/streams';
import eventEmitter from 'utils/eventEmitter';
import { state, IStateStream } from 'services/state';
import { topicsStream, ITopics, ITopicData } from 'services/topics';
import { projectsStream, IProjects, IProjectData } from 'services/projects';
import { namespace as ButtonBarNamespace, State as IButtonBarState } from './ButtonBar';
import messages from './messages';
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

type Props = {
  intl: ReactIntl.InjectedIntl;
  locale: string;
  onSubmit: () => void;
};

export type State = {
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

export const namespace = 'IdeasNewPage2/NewIdeaForm';

export default class NewIdeaForm extends React.PureComponent<Props, State> {
  state$: IStateStream<State>;
  topics$: IStream<ITopics | null>;
  projects$: IStream<IProjects | null>;
  subscriptions: Rx.Subscription[];
  titleInputElement: HTMLInputElement | null;
  descriptionElement: any | null;

  constructor() {
    super();
    this.state$ = state.createStream<State>(namespace, namespace);
    this.topics$ = topicsStream();
    this.projects$ = projectsStream();
    this.subscriptions = [];
    this.titleInputElement = null;
    this.descriptionElement = null;
  }

  componentWillMount() {
    this.subscriptions = [
      this.state$.observable.subscribe(state => this.setState(state)),

      eventEmitter.observe(ButtonBarNamespace, 'submit').subscribe(this.handleOnSubmit),

      Rx.Observable.combineLatest(
        this.topics$.observable,
        this.projects$.observable
      ).subscribe(([topics, projects]) => {
        this.state$.next({
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
    if (list) {
      return (list.data as (ITopicData | IProjectData)[]).map(item => ({
        value: item.id,
        label: item.attributes.title_multiloc[this.props.locale]
      } as IOption));
    }

    return null;
  }

  handleTitleOnChange = (title: string) => {
    this.state$.next({ title, titleError: null });
  }

  handleDescriptionOnChange = async (description: EditorState) => {
    const currentState = await this.state$.getCurrent();
    const descriptionError = (description.getCurrentContent().hasText() ? null : currentState.descriptionError);
    this.state$.next({ description, descriptionError });
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

  generateImagePreview(image: ImageFile) {
    if (image.type && (image.type === 'image/jpeg' || image.type === 'image/jpg' || image.type === 'image/png' || image.type === 'image/gif')) {
      const blob = new Blob([image], { type: image.type });
      return window.URL.createObjectURL(blob);
    }

    return undefined;
  }

  handleUploadOnAdd = async (newImage: ImageFile) => {
    let images: ExtendedImageFile[] | null = null;
    const currentState = await this.state$.getCurrent();
    const image = newImage as ExtendedImageFile;
    image.preview = this.generateImagePreview(newImage);

    if (currentState.images && currentState.images.length > 0) {
      images = currentState.images.concat(image);
    } else {
      images = [image];
    }

    this.state$.next({ images });
  }

  handleUploadOnRemove = async (removedImage: ImageFile) => {
    const currentState = await this.state$.getCurrent();
    const images = _(currentState.images).filter(image => image.preview !== removedImage.preview).value();
    this.state$.next({ images });

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

    this.state$.next({ titleError, descriptionError });

    if (titleError) {
      scrollToComponent(this.titleInputElement, { align:'top', offset: -240, duration: 300 });
      setTimeout(() => this.titleInputElement && this.titleInputElement.focus(), 300);
    } else if (descriptionError) {
      scrollToComponent(this.descriptionElement.editor.refs.editor, { align:'top', offset: -200, duration: 300 });
      setTimeout(() => this.descriptionElement && this.descriptionElement.focusEditor(), 300);
    }

    return (!titleError && !descriptionError);
  }

  handleOnSubmit = () => {
    const { title, description } = this.state;

    if (this.validate(title, description)) {
      this.props.onSubmit();
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
