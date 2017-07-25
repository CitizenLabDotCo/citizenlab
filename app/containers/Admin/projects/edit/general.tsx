// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import { injectIntl, intlShape } from 'react-intl';
import { EditorState, ContentState, convertToRaw, convertFromHTML } from 'draft-js';
import draftjsToHtml from 'draftjs-to-html';

// Store
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { makeSelectSetting } from 'utils/tenant/selectors';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';

// Services
import { observeProject, IProjectData } from 'services/projects';

// Components
import Input from 'components/UI/Input';
import Editor from 'components/UI/Editor';
import Upload from 'components/UI/Upload';

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
  project: IProjectData | null,
  uploadedImages: any,
  editorState: EditorState,
};

class AdminProjectEditGeneral extends React.Component<Props, State> {
  subscription: Rx.Subscription;

  constructor() {
    super();

    this.state = {
      project: null,
      uploadedImages: [],
      editorState: EditorState.createEmpty(),
    };
  }

  componentDidMount() {
    if (this.props.params.slug) {
      this.subscription = observeProject(this.props.params.slug).observable.subscribe((project) => {

        const blocksFromHtml = convertFromHTML(project.data.attributes.description_multiloc[this.props.userLocale]);
        const editorContent = ContentState.createFromBlockArray(blocksFromHtml.contentBlocks, blocksFromHtml.entityMap);

        this.setState({
          project: project.data,
          editorState:  EditorState.createWithContent(editorContent)});
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

  handleUploadOnAdd = () => {
    console.log(arguments);
  }

  handleUploadOnRemove = () => {
    console.log(arguments);
  }


  render() {
    const { project, uploadedImages, editorState } = this.state;
    const { userLocale } = this.props;

    return (
      <div>
        <label htmlFor="">Title</label>
        <Input
          type="text"
          placeholder=""
          value={project ? project.attributes.title_multiloc[userLocale] : ''}
          error=""
          onChange={this.changeTitle}
          setRef={this.setRef}
        />

        <label htmlFor="">Description</label>
        <Editor
          placeholder=""
          value={editorState}
          error=""
          onChange={this.changeDesc}
        />

        <label>Header image</label>
        <Upload
          intl={this.props.intl}
          items={uploadedImages}
          onAdd={this.handleUploadOnAdd}
          onRemove={this.handleUploadOnRemove}
        />

      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  userLocale: makeSelectLocale(),
  tenantLocales: makeSelectSetting(['core', 'locales']),
});

export default connect(mapStateToProps)(AdminProjectEditGeneral);
