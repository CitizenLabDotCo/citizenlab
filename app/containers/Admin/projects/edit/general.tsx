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
import { observeProject, IProjectData, updateProject, IProjectImageData, getProjectImages, IProjectUpdateData } from 'services/projects';
import { getBase64 } from 'services/image_tools';

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
  margin-bottom: 1em;
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
  projectImages: IProjectImageData[] | null,
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
      projectImages: null
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
          {projectImages && projectImages.map((image) => (
            <div key={image.id}><img src={image.attributes.versions.small} alt="" role="presentation"/></div>
          ))}
        </FieldWrapper>

        <button onClick={this.saveProject}>Save</button>
      </FormWrapper>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  userLocale: makeSelectLocale(),
  tenantLocales: makeSelectSetting(['core', 'locales']),
});

export default injectTFunc(injectIntl(connect(mapStateToProps)(AdminProjectEditGeneral)));
