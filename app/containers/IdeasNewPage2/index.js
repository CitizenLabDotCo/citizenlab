import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import styled from 'styled-components';
import { Button, Input } from 'semantic-ui-react';
import { preprocess } from 'utils';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { EditorState, convertToRaw } from 'draft-js';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { injectTFunc } from 'utils/containers/t/utils';
import WatchSagas from 'containers/WatchSagas';
import _ from 'lodash';
import sagas from './sagas';
import { loadTopics, loadAreas, loadProjects, submitIdea } from './actions';
import { makeSelectTopics, makeSelectAreas, makeSelectProjects } from './selectors';
import { makeSelectLocale } from '../LanguageProvider/selectors';
import { makeSelectCurrentUser } from '../../utils/auth/selectors';
import messages from './messages';
import MultipleSelect from './components/multipleselect';
import FormLabel from 'components/FormLabel';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import DropzoneComponent from 'react-dropzone-component';
import 'dropzone/dist/min/dropzone.min.css';
import 'react-dropzone-component/styles/filepicker.css';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 40px;
  padding-bottom: 1000px;
  background: #f2f2f2;
`;

const PageTitle = styled.h2`
  color: #333;
  font-size: 34px;
  font-weight: 500;
  margin-bottom: 30px;
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 600px;
`;

const StyledInput = styled(Input)`
  width: 100%;
  margin-bottom: 30px;
`;

const MultipleSelectWrapper = styled.div`
  width: 100%;
  margin-bottom: 30px;
`;

const EditorWrapper = styled.div`
  width: 100%;
  margin-bottom: 30px;

  .rdw-editor-toolbar {
    margin: 0;
    border: none;
    border-bottom: solid 1px #eee;
  }

  .rdw-editor-main {
    min-height: 150px;
    cursor: text;
    padding: 2px 12px;;
    background: #fff;
  }
`;

const StyledDropzone = styled(DropzoneComponent)`
  background: red;
  cursor: pointer;
  margin-bottom: 30px;
  background: #fff !important;
  border-color: #ccc !important;

  &:hover {
    border-color: #666 !important;
  }
`;

class IdeasNewPage2 extends React.Component {
  constructor() {
    super();

    this.state = {
      title: '',
      topics: [],
      areas: [],
      projects: [],
      description: EditorState.createEmpty(),
      images: [],
    };

    this.dropzone = null;
  }

  componentDidMount() {
    this.props.loadTopics();
    this.props.loadAreas();
    this.props.loadProjects();
    this.submitIdea();
  }

  getOptions(list) {
    const options = [];

    if (list && list.size && list.size > 0) {
      list.forEach((item) => {
        const id = item.get('id');
        const title = this.props.tFunc(item.getIn(['attributes', 'title_multiloc']).toJS());

        options.push({
          key: id,
          value: id,
          text: title,
        });
      });
    }

    return options;
  }

  handleTitleOnChange = (event) => {
    this.setState({ title: event.target.value });
  }

  handleMultipleSelectOnChange = (stateProp) => (value) => {
    this.setState({ [stateProp]: value });
  }

  handleOnEditorStateChange = (description) => {
    this.setState({ description });
  }

  submitIdea = () => {
    const { user, locale } = this.props;
    const userId = (user ? user.id : null);
    const title = { [locale]: this.state.title ? this.state.title : 'none' };
    const htmlEditorContent = draftToHtml(convertToRaw(this.state.description.getCurrentContent()));
    const description = { [locale]: htmlEditorContent ? htmlEditorContent : '<p></p>' }; // eslint-disable-line
    const topics = this.state.topics;
    const areas = this.state.areas;
    const project = (this.state.projects ? this.state.projects[0] : null);
    // const images = null;
    // const publicationStatus = (isDraft ? 'draft' : 'published');
    const publicationStatus = 'draft';

    this.props.submitIdea(userId, title, description, topics, areas, project, publicationStatus);
  }

  render() {
    const { formatMessage } = this.props.intl;

    return (
      <div>
        <WatchSagas sagas={sagas} />
        <PageContainer>
          <PageTitle>
            <FormattedMessage {...messages.pageTitle} />
          </PageTitle>

          <FormContainer>
            <FormLabel>
              <FormattedMessage {...messages.titleLabel} />
            </FormLabel>
            <StyledInput type="text" value={this.state.title} name="title" onChange={this.handleTitleOnChange} />

            <FormLabel>
              <FormattedMessage {...messages.descriptionLabel} />
            </FormLabel>
            <EditorWrapper>
              <Editor
                editorClassName="editor-class"
                editorState={this.state.description}
                onEditorStateChange={this.handleOnEditorStateChange}
                toolbar={{
                  options: ['inline', 'list', 'link'],
                  inline: {
                    options: ['bold', 'italic'],
                  },
                  list: {
                    options: ['unordered', 'ordered'],
                  },
                }}
              />
            </EditorWrapper>

            <FormLabel>
              <FormattedMessage {...messages.topicsLabel} />
            </FormLabel>
            <MultipleSelectWrapper>
              <MultipleSelect
                value={this.state.topics}
                placeholder={formatMessage({ ...messages.topicsPlaceholder })}
                options={this.getOptions(this.props.topics)}
                onChange={this.handleMultipleSelectOnChange('topics')}
                max={3}
              />
            </MultipleSelectWrapper>

            <FormLabel>
              <FormattedMessage {...messages.areasLabel} />
            </FormLabel>
            <MultipleSelectWrapper>
              <MultipleSelect
                value={this.state.areas}
                placeholder={formatMessage({ ...messages.areasPlaceholder })}
                options={this.getOptions(this.props.areas)}
                onChange={this.handleMultipleSelectOnChange('areas')}
                max={3}
              />
            </MultipleSelectWrapper>

            <FormLabel>
              <FormattedMessage {...messages.projectsLabel} />
            </FormLabel>
            <MultipleSelectWrapper>
              <MultipleSelect
                value={this.state.projects}
                placeholder={formatMessage({ ...messages.projectsPlaceholder })}
                options={this.getOptions(this.props.projects)}
                onChange={this.handleMultipleSelectOnChange('projects')}
                max={1}
              />
            </MultipleSelectWrapper>

            <FormLabel>
              <FormattedMessage {...messages.imagesLabel} />
            </FormLabel>
            <StyledDropzone
              config={{
                iconFiletypes: ['.jpg', '.png', '.gif'],
                showFiletypeIcon: true,
                postUrl: 'none',
              }}
              djsConfig={{
                acceptedFiles: 'image/jpeg, image/png, image/gif',
                autoProcessQueue: false,
                addRemoveLinks: true,
                maxFiles: 5,
                maxFileSize: 5,
              }}
              eventHandlers={{
                init: (dropzone) => (this.dropzone = dropzone),
                addedfile: (image) => console.log(image),
                removedfile: (image) => console.log(image),
              }}
            />

            <Button onClick={this.submitIdea}>
              <FormattedMessage {...messages.submit} />
            </Button>
          </FormContainer>
        </PageContainer>
      </div>
    );
  }
}

IdeasNewPage2.propTypes = {
  intl: intlShape.isRequired,
  tFunc: PropTypes.func.isRequired,
  locale: PropTypes.string.isRequired,
  user: PropTypes.object,
  topics: ImmutablePropTypes.list.isRequired,
  areas: ImmutablePropTypes.list.isRequired,
  projects: ImmutablePropTypes.list.isRequired,
  loadTopics: PropTypes.func.isRequired,
  loadAreas: PropTypes.func.isRequired,
  loadProjects: PropTypes.func.isRequired,
  submitIdea: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  locale: makeSelectLocale(),
  user: makeSelectCurrentUser(),
  topics: makeSelectTopics(),
  areas: makeSelectAreas(),
  projects: makeSelectProjects(),
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  loadTopics,
  loadAreas,
  loadProjects,
  submitIdea,
}, dispatch);

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { locale, user, topics, areas, projects } = stateProps;
  return {
    locale,
    user,
    topics,
    areas,
    projects,
    ...dispatchProps,
    ...ownProps,
  };
};

export default injectTFunc(injectIntl(preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(IdeasNewPage2)));
