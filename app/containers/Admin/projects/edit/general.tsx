// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import { injectTFunc } from 'utils/containers/t/utils';
import { injectIntl, intlShape } from 'react-intl';
import { EditorState, ContentState, convertToRaw, convertFromHTML } from 'draft-js';
import draftjsToHtml from 'draftjs-to-html';
import styled from 'styled-components';

// Store
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { makeSelectSetting } from 'utils/tenant/selectors';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';

// Services
import { getBase64 } from 'services/image_tools';
import { observeProject,
  IProjectData,
  updateProject,
  IProjectImageData,
  getProjectImages,
  IProjectUpdateData,
  uploadProjectImage,
  deleteProjectImage,
} from 'services/projects';

// Components
import Input from 'components/UI/Input';
import Editor from 'components/UI/Editor';
import Upload from 'components/UI/Upload';

// Style
const FormWrapper = styled.div`
  img {
    max-width: 100%;
  }
`;

const FieldWrapper = styled.div`
  margin-bottom: 2em;
`;

const ProjectImages = styled.div`
  display: flex;
`;

const ImageWrapper = styled.div`
  margin: .5rem;
  position: relative;

  &:first-child{
    margin-left: 0;
  }
`;

const DeleteButton = styled.button`
  background: rgba(0, 0, 0, .5);
  border-radius: 50%;
  color: black;
  right: -.5rem;
  position: absolute;
  top: -.5rem;
  z-index: 1;
`;

const SaveButton = styled.button`
  background: #d60065;
  border-radius: 5px;
  color: white;
  font-size: 1.25rem;
  padding: 1rem 2rem;
`;


// Component typing
type Props = {
  intl: ReactIntl.InjectedIntl,
  lang: string,
  params: {
    slug: string | null,
  },
  userLocale: string,
  tenantLocales: string[],
};

type State = {
  loading: boolean,
  project: IProjectData | null,
  uploadedImages: any,
  uploadedHeader: string | null,
  editorState: EditorState,
  projectImages: IProjectImageData[],
};

class AdminProjectEditGeneral extends React.Component<Props, State> {
  subscription: Rx.Subscription;

  constructor() {
    super();

    this.state = {
      loading: false,
      project: null,
      uploadedImages: [],
      editorState: EditorState.createEmpty(),
      uploadedHeader: null,
      projectImages: []
    };
  }

  componentDidMount() {
    if (this.props.params.slug) {
      this.subscription = observeProject(this.props.params.slug).observable
      .switchMap((project) => {
        return getProjectImages(project.data.id).observable.map((images) => ({
          project: project.data,
          projectImages: images.data,
        }));
      })
      .subscribe(({ project, projectImages }) => {
        const blocksFromHtml = convertFromHTML(project.attributes.description_multiloc[this.props.userLocale]);
        const editorContent = ContentState.createFromBlockArray(blocksFromHtml.contentBlocks, blocksFromHtml.entityMap);

        this.setState({
          project,
          projectImages,
          editorState:  EditorState.createWithContent(editorContent),
          uploadedHeader: null,
          uploadedImages: [],
          loading: false,
        });
      });
    }
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  setRef = (element) => {

  }

  changeTitle = (value: string): void => {
    const newVal = _.set({}, `project.attributes.title_multiloc.${this.props.userLocale}`, value);
    this.setState(_.merge({}, this.state, newVal));
  }

  changeDesc = (editorState: EditorState): void => {
    const project = this.state.project;

    _.set(project, `attributes.description_multiloc.${this.props.userLocale}`, draftjsToHtml(convertToRaw(editorState.getCurrentContent())));

    this.setState({
      editorState,
      project,
    });
  }

  handleHeaderUpload = async (image) => {
    const base64 = await getBase64(image) as string;
    this.setState({ uploadedHeader: base64 });
  }

  handleUploadOnRemove = () => {

  }

  handleProjectImageUpload = async (image) => {
    const { project, projectImages } = this.state;
    const base64 = await getBase64(image) as string;
    if (project && project.id) {
      uploadProjectImage(project.id, base64).then((response) => {
        projectImages.push(response.data);

        this.setState({ projectImages });
      });
    }
  }

  deletePicture = (event) => {
    const { project } = this.state;

    if (project) {
      const imageId = event.target.dataset.imageId;
      const projectId = project.id;

      deleteProjectImage(projectId, imageId).then(() => {
        this.setState({ projectImages: _.reject(this.state.projectImages, { id: imageId }) });
      });
    }
  }

  saveProject = () => {
    const projectData = this.state.project;

    if (projectData) {
      this.setState({ loading: true });

      const project  = {
        id: projectData.id,
        title_multiloc: projectData.attributes.title_multiloc,
        description_multiloc: projectData.attributes.description_multiloc,
      } as IProjectUpdateData;

      if (this.state.uploadedHeader) {
        project.header_bg = this.state.uploadedHeader;
      }

      updateProject(project);
    }
  }


  render() {
    const { project, uploadedImages, editorState, uploadedHeader, loading, projectImages } = this.state;
    const { userLocale } = this.props;

    return (
      <FormWrapper>
        {loading &&
          <div>Loading…</div>
        }

        <FieldWrapper>
          <label htmlFor="">Title</label>
          <Input
            type="text"
            placeholder=""
            value={project ? project.attributes.title_multiloc[userLocale] : ''}
            error=""
            onChange={this.changeTitle}
            setRef={this.setRef}
          />
        </FieldWrapper>

        <FieldWrapper>
          <label htmlFor="">Description</label>
          <Editor
            placeholder=""
            value={editorState}
            error=""
            onChange={this.changeDesc}
          />
        </FieldWrapper>

        <FieldWrapper>
          <label>Header image</label>
          {uploadedHeader &&
            <img src={uploadedHeader} alt="" role="presentation" />
          }
          {!uploadedHeader && project && project.attributes.header_bg.medium &&
            <img src={project.attributes.header_bg.medium} alt="" role="presentation" />
          }
          <Upload
            accept="image/jpg, image/jpeg, image/png, image/gif"
            intl={this.props.intl}
            items={uploadedImages}
            onAdd={this.handleHeaderUpload}
            onRemove={this.handleUploadOnRemove}
          />
        </FieldWrapper>

        <FieldWrapper>
          <label>Project Images</label>
          <ProjectImages>
            {projectImages && projectImages.map((image) => (
              <ImageWrapper key={image.id}>
                <DeleteButton onClick={this.deletePicture} data-image-id={image.id}>🗑️</DeleteButton>
                <img src={image.attributes.versions.small} alt="" role="presentation"/>
              </ImageWrapper>
            ))}
          </ProjectImages>
          <Upload
            accept="image/jpg, image/jpeg, image/png, image/gif"
            intl={this.props.intl}
            items={uploadedImages}
            onAdd={this.handleProjectImageUpload}
            onRemove={this.handleUploadOnRemove}
          />
        </FieldWrapper>

        <SaveButton onClick={this.saveProject}>Save</SaveButton>
      </FormWrapper>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  userLocale: makeSelectLocale(),
  tenantLocales: makeSelectSetting(['core', 'locales']),
});

export default injectTFunc(injectIntl(connect(mapStateToProps)(AdminProjectEditGeneral)));
