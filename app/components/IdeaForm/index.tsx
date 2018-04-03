import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { withRouter, WithRouterProps } from 'react-router';
import { find, pick, isEqual } from 'lodash';

// libraries
import scrollToComponent from 'react-scroll-to-component';
import * as bowser from 'bowser';

// draft-js
import { EditorState } from 'draft-js';

// components
import Select from 'components/UI/Select';
import MultipleSelect from 'components/UI/MultipleSelect';
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import LocationInput from 'components/UI/LocationInput';
import Editor from 'components/UI/Editor';
import ImagesDropzone from 'components/UI/ImagesDropzone';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream } from 'services/tenant';
import { topicsStream, ITopics, ITopicData } from 'services/topics';
import { projectsStream, IProjects, IProjectData } from 'services/projects';

// utils
import eventEmitter from 'utils/eventEmitter';
import { getLocalized } from 'utils/i18n';
import { getEditorStateFromHtmlString, getHtmlStringFromEditorState } from 'utils/editorTools';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { IOption, ImageFile, Locale } from 'typings';

// style
import styled from 'styled-components';

const Form = styled.form`
  width: 100%;
  display: 'flex';
  flex-direction: column;
  align-items: center;
`;

const FormElement: any = styled.div`
  width: 100%;
  margin-bottom: 40px;
`;

export interface IIdeaFormOutput {
  title: string;
  description: string;
  selectedTopics: IOption[] | null;
  selectedProject: IOption | null;
  position: string;
  imageFile: ImageFile[] | null;
}

interface Props {
  title: string | null;
  description: string | null;
  selectedTopics: IOption[] | null;
  selectedProject: IOption | null;
  position: string;
  imageFile: ImageFile[] | null;
  onSubmit: (arg: IIdeaFormOutput) => void;
}

interface State {
  topics: IOption[] | null;
  projects: IOption[] | null;
  title: string;
  description: EditorState;
  selectedTopics: IOption[] | null;
  selectedProject: IOption | null;
  position: string;
  imageFile: ImageFile[] | null;
  titleError: string | JSX.Element | null;
  descriptionError: string | JSX.Element | null;
}

class IdeaForm extends React.PureComponent<Props & InjectedIntlProps & WithRouterProps, State> {
  subscriptions: Rx.Subscription[];
  titleInputElement: HTMLInputElement | null;
  descriptionElement: any | null;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      topics: null,
      projects: null,
      title: '',
      description: EditorState.createEmpty(),
      selectedTopics: null,
      selectedProject: null,
      position: '',
      imageFile: null,
      titleError: null,
      descriptionError: null
    };
    this.subscriptions = [];
    this.titleInputElement = null;
    this.descriptionElement = null;
  }

  componentDidMount() {
    const { title, description, selectedTopics, selectedProject, position, imageFile } = this.props;

    const locale$ = localeStream().observable;
    const currentTenantLocales$ = currentTenantStream().observable.map(currentTenant => currentTenant.data.attributes.settings.core.locales);
    const topics$ = topicsStream().observable;
    const projects$ = projectsStream().observable;

    this.setState({
      selectedTopics,
      selectedProject,
      position,
      imageFile,
      title: (title || ''),
      description: getEditorStateFromHtmlString(description),
    });

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenantLocales$,
        topics$,
      ).subscribe(([locale, currentTenantLocales, topics]) => {
        this.setState({
          topics: this.getOptions(topics, locale, currentTenantLocales)
        });
      }),

      Rx.Observable.combineLatest(
        locale$,
        currentTenantLocales$,
        projects$,
      ).subscribe(([locale, currentTenantLocales, projects]) => {
        let selectedProject;

        if (this.props.params.slug) {
          const currentProject = find(projects.data, (project) => project.attributes.slug === this.props.params.slug);
          selectedProject = this.getOptions({ data: [currentProject] } as IProjects, locale, currentTenantLocales);
          selectedProject = selectedProject[0];
        }

        this.setState({
          selectedProject,
          projects: this.getOptions(projects, locale, currentTenantLocales)
        });
      }),

      eventEmitter.observeEvent('IdeaFormSubmitEvent').subscribe(this.handleOnSubmit),
    ];

    if (!bowser.mobile && this.titleInputElement !== null) {
      setTimeout(() => (this.titleInputElement as HTMLInputElement).focus(), 50);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const partialPropertyNames = ['selectedTopics', 'selectedTopics', 'position', 'title'];
    const oldPartialProps = pick(prevProps, partialPropertyNames);
    const newPartialProps = pick(this.props, partialPropertyNames);

    if (!isEqual(oldPartialProps, newPartialProps)) {
      const title = (this.props.title || '');
      const { selectedTopics, selectedProject, position } = this.props;
      this.setState({ title, selectedTopics, selectedProject, position });
    }

    if (this.props.description !== prevProps.description) {
      this.setState({ description: getEditorStateFromHtmlString(this.props.description) });
    }

    if (
      prevProps.imageFile !== null && this.props.imageFile === null
      || prevProps.imageFile === null && this.props.imageFile !== null
      || prevProps.imageFile && this.props.imageFile && prevProps.imageFile[0].base64 !== this.props.imageFile[0].base64
    ) {
      this.setState({ imageFile: this.props.imageFile });
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getOptions = (list: ITopics | IProjects | null, locale: Locale | null, currentTenantLocales: Locale[]) => {
    if (list && locale) {
      return (list.data as (ITopicData | IProjectData)[]).map(item => ({
        value: item.id,
        label: getLocalized(item.attributes.title_multiloc, locale, currentTenantLocales)
      } as IOption));
    }

    return null;
  }

  handleTitleOnChange = (title: string) => {
    this.setState({ title, titleError: null });
  }

  handleDescriptionOnChange = async (description: EditorState) => {
    const isDescriptionEmpty = (!description || !description.getCurrentContent().hasText());
    this.setState((state) => ({
      description,
      descriptionError: (isDescriptionEmpty ?  state.descriptionError : null) })
    );
  }

  handleTopicsOnChange = (selectedTopics: IOption[]) => {
    this.setState({ selectedTopics });
  }

  handleProjectOnChange = (selectedProject: IOption) => {
    this.setState({ selectedProject });
  }

  handleLocationOnChange = (position: string) => {
    this.setState({ position });
  }

  handleUploadOnAdd = (imageFile: ImageFile) => {
    this.setState({ imageFile: [imageFile] });
  }

  handleUploadOnUpdate = (imageFile: ImageFile[]) => {
    this.setState({ imageFile });
  }

  handleUploadOnRemove = () => {
    this.setState({ imageFile: null });
  }

  handleTitleInputSetRef = (element: HTMLInputElement) => {
    this.titleInputElement = element;
  }

  handleDescriptionInputSetRef = (element) => {
    this.descriptionElement = element;
  }

  validate = (title: string | null, description: EditorState) => {
    const titleError = (!title ? <FormattedMessage {...messages.titleEmptyError} /> : null);
    const hasDescriptionError = (!description || !description.getCurrentContent().hasText());
    const descriptionError = (hasDescriptionError ? <FormattedMessage {...messages.descriptionEmptyError} /> : null);

    this.setState({ titleError, descriptionError });

    if (titleError) {
      scrollToComponent(this.titleInputElement, { align: 'top', offset: -240, duration: 300 });
      setTimeout(() => this.titleInputElement && this.titleInputElement.focus(), 300);
    } else if (descriptionError) {
      scrollToComponent(this.descriptionElement.editor.refs.editor, { align: 'top', offset: -200, duration: 300 });
      setTimeout(() => this.descriptionElement && this.descriptionElement.focusEditor(), 300);
    }

    return (!titleError && !descriptionError);
  }

  handleOnSubmit = () => {
    const { title, description, selectedTopics, selectedProject, position, imageFile } = this.state;

    if (this.validate(title, description)) {
      const output: IIdeaFormOutput = {
        title,
        selectedTopics,
        selectedProject,
        position,
        imageFile,
        description: getHtmlStringFromEditorState(description)
      };

      this.props.onSubmit(output);
    }
  }

  render() {
    const className = this.props['className'];
    const { formatMessage } = this.props.intl;
    const { topics, projects, title, description, selectedTopics, selectedProject, position, imageFile, titleError, descriptionError } = this.state;

    return (
      <Form className={className}>
        <FormElement name="titleInput">
          <Label value={<FormattedMessage {...messages.titleLabel} />} htmlFor="title" />
          <Input
            id="title"
            type="text"
            value={title}
            placeholder={formatMessage(messages.titlePlaceholder)}
            error={titleError}
            onChange={this.handleTitleOnChange}
            setRef={this.handleTitleInputSetRef}
            maxCharCount={80}
          />
        </FormElement>

        <FormElement name="descriptionInput">
          <Label value={<FormattedMessage {...messages.descriptionLabel} />} htmlFor="editor" />
          <Editor
            id="editor"
            value={description}
            placeholder={<FormattedMessage {...messages.descriptionPlaceholder} />}
            error={descriptionError}
            onChange={this.handleDescriptionOnChange}
            setRef={this.handleDescriptionInputSetRef}
          />
        </FormElement>

        {topics && topics.length > 0 &&
          <FormElement>
            <Label value={<FormattedMessage {...messages.topicsLabel} />} htmlFor="topics" />
            <MultipleSelect
              value={selectedTopics}
              placeholder={<FormattedMessage {...messages.topicsPlaceholder} />}
              options={topics}
              max={2}
              onChange={this.handleTopicsOnChange}
            />
          </FormElement>
        }

        {!this.props.params.slug && projects && projects.length > 0 &&
          <FormElement>
            <Label value={<FormattedMessage {...messages.projectsLabel} />} htmlFor="projects" />
            <Select
              value={selectedProject}
              placeholder={<FormattedMessage {...messages.projectsPlaceholder} />}
              options={projects}
              onChange={this.handleProjectOnChange}
            />
          </FormElement>
        }

        <FormElement>
          <Label value={<FormattedMessage {...messages.locationLabel} />} htmlFor="location" />
          <LocationInput
            id="location"
            value={position}
            placeholder={formatMessage(messages.locationPlaceholder)}
            onChange={this.handleLocationOnChange}
          />
        </FormElement>

        <FormElement>
          <Label value={<FormattedMessage {...messages.imageUploadLabel} />} />
          <ImagesDropzone
            images={imageFile}
            imagePreviewRatio={135 / 298}
            acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
            maxImageFileSize={5000000}
            maxNumberOfImages={1}
            placeholder={<FormattedMessage {...messages.imageUploadPlaceholder} />}
            onAdd={this.handleUploadOnAdd}
            onUpdate={this.handleUploadOnUpdate}
            onRemove={this.handleUploadOnRemove}
          />
        </FormElement>
      </Form>
    );
  }
}

export default withRouter<Props>(injectIntl(IdeaForm));
