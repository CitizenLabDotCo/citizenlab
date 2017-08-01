import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import { media } from 'utils/styleUtils';
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
import draftToHtml from 'draftjs-to-html';
import { IOption } from 'typings';
import { addIdea } from 'services/ideas';
import { addIdeaImage } from 'services/ideaImages';
import { observeTopics, ITopics, ITopicData } from 'services/topics';
import { observeProjects, IProjects, IProjectData } from 'services/projects';
import { observeCurrentUser, getAuthUser } from 'services/auth';
import component, { IDefaultProps } from './decorator';
import messages from './messages';
import styled from 'styled-components';

const Container = styled.div`
  background: #f4f4f4;
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

interface IComponentProps {
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
  submitError: string | null;
  processing: boolean;
}

interface IProps extends IDefaultProps<IComponentProps>, IComponentProps {}
interface IState {}

const getOptions = (list: ITopics | IProjects) => {
  if (list) {
    return (list.data as (ITopicData | IProjectData)[]).map(item => ({
      value: item.id,
      label: item.attributes.title_multiloc.en
      // label: this.props.tFunc(item.attributes.title_multiloc) as string,
    } as IOption));
  } else {
    return null;
  }
};

@component<IComponentProps>({
  id: 'NewIdeaForm',
  props: {
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
    submitError: null,
    processing: false
  },
  data: [
    observeTopics().observable.map(data => ({ topics: getOptions(data) })),
    observeProjects().observable.map(data => ({ projects: getOptions(data) }))
  ]
})
class NewIdeaForm extends React.PureComponent<IProps, IState> {
  titleInputElement: HTMLInputElement | null;

  constructor() {
    super();
    this.titleInputElement = null;
  }

  componentDidMount() {
    if (this.titleInputElement !== null) {
      this.titleInputElement.focus();
    }
  }

  componentWillUnmount() {
    const { images } = this.props;
    _(images).filter(image => image.preview).forEach(image => window.URL.revokeObjectURL(image.preview as string));
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
    return {
      type: 'Point',
      coordinates: [lat, lng]
    };
  }

  handleTitleOnChange = (title: string) => {
    this.props.update({ title, titleError: null });
  }

  handleDescriptionOnChange = (description: EditorState) => {
    this.props.update((props) => {
      const descriptionError = (description.getCurrentContent().hasText() ? null : props.descriptionError);
      return { description, descriptionError };
    });
  }

  handleTopicsOnChange = (selectedTopics: IOption[]) => {
    this.props.update({ selectedTopics });
  }

  handleProjectOnChange = (selectedProject: IOption) => {
    this.props.update({ selectedProject });
  }

  handleLocationOnChange = (location: string) => {
    this.props.update({ location });
  }

  handleUploadOnAdd = async (image: ImageFile) => {
    const { images } = this.props;
    const base64 = await this.getBase64(image);
    const newImage: ExtendedImageFile = { ...image, base64 };
    const newImages: ExtendedImageFile[] = (images ? [...images, newImage] : [newImage]);
    this.props.update({ images: newImages });
  }

  handleUploadOnRemove = (removedImage) => {
    const { images } = this.props;
    const newImages = _(images).filter((image) => image.preview !== removedImage.preview).value();
    this.props.update({ images: newImages });
  }

  handleSetRef = (element: HTMLInputElement) => {
    this.titleInputElement = element;
  }

  validate = (title: string | null, description: EditorState) => {
    const { formatMessage } = this.props.intl;
    const titleError = (!title ? formatMessage(messages.titleEmptyError) : null);
    const hasDescriptionError = (!description || !description.getCurrentContent().hasText());
    const descriptionError = (hasDescriptionError ? formatMessage(messages.descriptionEmptyError) : null);
    this.props.update({ titleError, descriptionError });
    return (!titleError && !descriptionError);
  }

  handleOnSubmit = async () => {
    const { locale, topics, projects, title, description, selectedTopics, selectedProject, location, images } = this.props;
    const { formatMessage } = this.props.intl;

    if (this.validate(title, description)) {
      try {
        this.props.update({ processing: true });
        const authUser = await getAuthUser();
        const userId = authUser.data.id;
        const ideaTitle = { [locale]: title as string };
        const ideaDescription = { [locale]: draftToHtml(convertToRaw(description.getCurrentContent())) };
        const topicIds = (selectedTopics ? selectedTopics.map(topic => topic.value) : null);
        const projectId = (selectedProject ? selectedProject.value : null);
        const locationGeoJSON = (_.isString(location) && !_.isEmpty(location) ? await this.convertToGeoJson(location) : null);
        const locationDescription = (_.isString(location) && !_.isEmpty(location) ? location : null);
        const idea = await addIdea(userId, 'published', ideaTitle, ideaDescription, topicIds, projectId, locationGeoJSON, locationDescription);
        await Promise.all(_(images).map((image, index) => addIdeaImage(idea.data.id, image.base64, index)).value());
        this.props.update({ processing: false });
      } catch (error) {
        if (_.isError(error) && error.message === 'not authenticated') {
          window.scrollTo(0, 0);
          this.props.update({ processing: false });
        }
      }
    }
  }

  render() {
    const { topics, projects, title, description, selectedTopics, selectedProject, location, images, titleError, descriptionError, submitError, processing } = this.props;
    const { formatMessage } = this.props.intl;
    const uploadedImages = _(images).map((image) => _.omit(image, 'base64') as ImageFile).value();
    const hasAllRequiredContent = title && description && description.getCurrentContent().hasText();

    return (
      <Container>
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
              maxSize={5000000}
              maxItems={1}
              placeholder={formatMessage(messages.imageUploadPlaceholder)}
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
              disabled={!hasAllRequiredContent}
            />
            <Error text={submitError} marginTop="0px" />
          </MobileButton>
        </Form>

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
      </Container>
    );
  }
}

export default NewIdeaForm as any;
