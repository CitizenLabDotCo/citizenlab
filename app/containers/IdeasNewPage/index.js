import React from 'react';
import PropTypes from 'prop-types';
import HelmetIntl from 'components/HelmetIntl';
import { createStructuredSelector } from 'reselect';
// import { Container, Label, Divider } from 'semantic-ui-react';
import styled from 'styled-components';
// import FormLabel from 'components/FormLabel';
// import Breadcrumbs from 'components/Breadcrumbs';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Saga } from 'react-redux-saga';
import { preprocess } from 'utils/reactRedux';
import { bindActionCreators } from 'redux';
import WatchSagas from 'containers/WatchSagas';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Dropzone from 'react-dropzone';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import {
  setTitle, storeAttachment, storeImage, storeImageError, storeAttachmentError,
  publishIdeaRequest, storeSelectedTopics, storeSelectedAreas, invalidForm, storeSelectedProject, resetData,
} from './actions';
import IdeaEditorWrapper from './editor/IdeaEditorWrapper';
// import AttachmentList from './attachments/AttachmentList';
// import ImageList from './images/ImageList';
import canPublish from './editor/canPublish';
import { selectSubmitIdea } from './selectors';
import { makeSelectLocale } from '../LanguageProvider/selectors';
import { makeSelectCurrentUser } from '../../utils/auth/selectors';
import messages from './messages';

// areas, topics and projects
import sagasAreas from 'resources/areas/sagas';
import sagasTopics from 'resources/topics/sagas';
import sagasProjects from 'resources/projects/sagas';
import { loadTopicsRequest } from 'resources/topics/actions';
import { loadAreasRequest } from 'resources/areas/actions';
import { loadProjectsRequest } from 'resources/projects/actions';
import sagas from './sagas';

import FormComponent from 'components/forms/formComponent';
import { Form } from 'semantic-ui-react';
import RtfEditor from 'components/forms/inputs/rtfEditor';
import Button from 'components/buttons/loader';

const PageContainer = styled.div`
  background: '#eeeeee';
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
  padding-top: 50px;
  padding-bottom: 100px;
  padding-left: 20px;
  padding-right: 20px;
`;

const PageTitle = styled.div`
  color: #444;
  font-weight: 400;
  font-size: 38px;
  text-align: center;
  margin-bottom: 50px;
`;

const StyledDropzone = styled(Dropzone)`
  background: red;
  cursor: pointer;

  &:hover {
    background: green;
  }
`;

export class IdeasNewPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    this.state = {
      editorState: EditorState.createEmpty(),
      initialStateSet: false,
    };

    // provide 'this' context to callbacks
    this.saveDraft = this.saveDraft.bind(this);
    this.storeIdea = this.storeIdea.bind(this);
    this.storeTopics = this.storeTopics.bind(this);
    this.storeAreas = this.storeAreas.bind(this);
    this.storeProject = this.storeProject.bind(this);
  }

  componentDidMount() {
    // load topics, areas and projects
    this.props.loadTopicsRequest(true);
    this.props.loadAreasRequest(true);
    this.props.loadProjectsRequest(true);
  }

  componentWillUnmount() {
    // reset state
    this.props.resetData();
  }

  sendIdea(isDraft) {
    const { content, shortTitleError, longTitleError, title, images, /* attachments, */ user, locale, selectedTopics, selectedAreas, selectedProjects } = this.props;
    this.props.publishIdeaClick(content, shortTitleError || longTitleError, title, images, /* attachments, */ user && user.id, locale, isDraft, selectedTopics.toJS(), selectedAreas.toJS(), selectedProjects.toJS());
  }

  saveDraft() {
    this.sendIdea(true);
  }

  storeIdea() {
    this.sendIdea(false);
  }

  storeTopics(topics) {
    this.props.storeSelectedTopics(topics);
  }

  storeAreas(areas) {
    this.props.storeSelectedAreas(areas);
  }

  storeProject(project) {
    this.props.storeSelectedProject(project);
  }

  onDrop = (files) => {
    let formData = null;

    formData = new FormData();

    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    fetch('http://server.com/api/upload', {
      method: 'POST',
      body: formData,
    }).then((res) => {
      console.log('Status', res);
    })
    .catch((error) => {
      console.log(error);
    });
  }

  onEditorStateChange = (editorState) => {
    this.setState({
      editorState,
    });

    // store temp draft
    const rawContent = convertToRaw(editorState.getCurrentContent());
    console.log(rawContent);
  };

  render() {
    const { editorState } = this.state;
    const { /* className, storeAttachment: storeAtt, */ storeImage: storeImg, setTitle: setT } = this.props;

    return (
      <div>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <PageContainer>
          <FormContainer>
            <PageTitle>
              <FormattedMessage {...messages.pageTitle} />
            </PageTitle>

            <WatchSagas sagas={sagas} />
            <Saga saga={sagasTopics.loadTopicsWatcher} />
            <Saga saga={sagasAreas.loadAreasWatcher} />
            <Saga saga={sagasProjects.loadProjectsWatcher} />

            {/* <Breadcrumbs /> */}

            <StyledDropzone accept="image/*" onDrop={this.onDrop}>
              <p>Try dropping some files here, or click to select files to upload.</p>
            </StyledDropzone>

            {/*
            <Editor
              wrapperClassName="wrapper-class"
              editorClassName="editor-class"
              toolbarClassName="toolbar-class"
              wrapperStyle={{ background: 'green' }}
              editorState={editorState}
              onEditorStateChange={this.onEditorStateChange}
            />
            */}

            {/*
            <IdeaEditorWrapper
              saveDraft={this.saveDraft}
              storeIdea={this.storeIdea}
              storeTopics={this.storeTopics}
              storeAreas={this.storeAreas}
              storeProject={this.storeProject}
              setTitle={setT}
              storeImage={storeImg}
            />
            */}

            {/*
            <FormLabel>
              <FormattedMessage {...messages.addImageLabel} />
            </FormLabel>
            <ImageList storeImage={storeImg} />
            */}

            {/* <StyledLabel>Location</StyledLabel> */}
            {/* TODO: location image here */}
            {/* <Divider /> */}
            {/* <StyledLabel>Attachments</StyledLabel> */}
            {/* <AttachmentList */}
            {/* storeAttachment={storeAtt} */}
            {/* /> */}
          </FormContainer>
        </PageContainer>
      </div>
    );
  }
}

IdeasNewPage.propTypes = {
  // className: PropTypes.string,
  // mapDispatch
  publishIdeaClick: PropTypes.func.isRequired,
  // storeAttachment: PropTypes.func.isRequired,
  storeImage: PropTypes.func.isRequired,
  user: PropTypes.object,
  storeSelectedTopics: PropTypes.func.isRequired,
  storeSelectedAreas: PropTypes.func.isRequired,
  storeSelectedProject: PropTypes.func.isRequired,
  locale: PropTypes.string,
  loadTopicsRequest: PropTypes.func.isRequired,
  loadAreasRequest: PropTypes.func.isRequired,
  // from mergeProps
  content: PropTypes.string,
  shortTitleError: PropTypes.bool.isRequired,
  longTitleError: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  images: PropTypes.any.isRequired,
  // attachments: PropTypes.any.isRequired,
  selectedTopics: ImmutablePropTypes.list.isRequired,
  selectedAreas: ImmutablePropTypes.list.isRequired,
  selectedProjects: ImmutablePropTypes.list.isRequired,
  setTitle: PropTypes.func.isRequired,
  loadProjectsRequest: PropTypes.func.isRequired,
  resetData: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  ideasNewPageState: selectSubmitIdea,
  locale: makeSelectLocale(),
  user: makeSelectCurrentUser(),
});

const customActionCreators = {
  publishIdeaClick(content, titleError, title, images, /* attachments, */ userId, locale, isDraft, topics, areas, projects) {
    const contentNotNull = content || '<p></p>';

    if (canPublish(contentNotNull, titleError, topics, areas, projects)) {
      // inject strings for current locale as a mutiloc object
      const htmlContents = {};
      const titles = {};
      htmlContents[locale] = contentNotNull;
      titles[locale] = title;

      return publishIdeaRequest(htmlContents, titles, images, /* attachments, */ userId, isDraft, topics, areas, projects);
    }
    return invalidForm();
  },
  setTitle(e) {
    return setTitle(e.target.value);
  },
  storeAttachment(file) {
    if (file) {
      return storeAttachment(file);
    }
    return storeAttachmentError();
  },
  storeImage(file) {
    if (file) {
      return storeImage(file);
    }
    return storeImageError();
  },
};

export const mapDispatchToProps = (dispatch) => bindActionCreators({
  /*
   * auto-binding
   */
  loadTopicsRequest,
  loadAreasRequest,
  storeSelectedTopics,
  storeSelectedAreas,
  storeSelectedProject,
  loadProjectsRequest,
  resetData,
  /*
   * manual bindings
   * (return actions to dispatch - with custom logic)
   */
  ...customActionCreators,
}, dispatch);

const mergeProps = ({ ideasNewPageState: pageState, locale, user }, dispatchProps) => ({
  content: pageState.getIn(['draft', 'content']),
  longTitleError: pageState.getIn(['draft', 'longTitleError']),
  shortTitleError: pageState.getIn(['draft', 'shortTitleError']),
  title: pageState.getIn(['draft', 'title']),
  images: pageState.getIn(['draft', 'images']),
  attachments: pageState.getIn(['draft', 'attachments']),
  selectedTopics: pageState.getIn(['topics', 'selected']),
  selectedAreas: pageState.getIn(['areas', 'selected']),
  selectedProjects: pageState.getIn(['projects', 'selected']),
  locale,
  user,
  ...dispatchProps,
});

// preprocess to avoid unnecessary re-renders when using mapDispatchToProps
export default injectIntl(preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(IdeasNewPage));
