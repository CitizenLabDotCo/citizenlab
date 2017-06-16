import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import styled from 'styled-components';
import { Button, Dropdown } from 'semantic-ui-react';
import { preprocess } from 'utils';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { EditorState, convertToRaw } from 'draft-js';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { injectTFunc } from 'utils/containers/t/utils';
import WatchSagas from 'containers/WatchSagas';
import sagas from './sagas';
import { loadTopics, loadAreas, loadProjects, submitIdea } from './actions';
import { makeSelectTopics, makeSelectAreas, makeSelectProjects } from './selectors';
import { makeSelectLocale } from '../LanguageProvider/selectors';
import { makeSelectCurrentUser } from '../../utils/auth/selectors';
import messages from './messages';
import MultipleSelect from 'components/MultipleSelect';
import Label from 'components/Form/Label';
import Input from 'components/Form/Input';
import Editor from 'components/Form/Editor';
import draftToHtml from 'draftjs-to-html';
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
  padding-bottom: 100px;
  background: #f8f8f8;
`;

const PageTitle = styled.h2`
  color: #333;
  font-size: 36px;
  font-weight: 400;
  margin-bottom: 20px;
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 650px;
`;

const InputWrapper = styled.div`
  width: 100%;
  padding-bottom: 40px;
`;

const MultipleSelectWrapper = styled.div`
  width: 100%;
  margin-bottom: 40px;
`;

const EditorWrapper = styled.div`
  margin-bottom: 40px;
`;

const StyledDropzone = styled(DropzoneComponent)`
  background: red;
  cursor: pointer;
  margin-bottom: 40px;
  background: #fff !important;
  border-width: 2px !important;
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
          value: id,
          label: title,
        });

        /*
        options.push({
          key: id,
          value: id,
          text: title,
        });
        */
      });
    }

    return options;
  }

  handleTitleOnChange = (title) => {
    this.setState({ title });
  }

  handleMultipleSelectOnChange = (name) => (value) => {
    this.setState({ [name]: value });
  }

  handleEditorOnChange = (description) => {
    this.setState({ description });
  }

  submitIdea = () => {
    const { user, locale } = this.props;
    const { title, description, topics, areas, projects } = this.state;

    const userId = (user ? user.id : null);
    const localTitle = { [locale]: title || 'none' };
    const htmlEditorContent = draftToHtml(convertToRaw(description.getCurrentContent()));
    const localDescription = { [locale]: htmlEditorContent || '<p></p>' };
    const project = (projects ? projects[0] : null);
    // const images = null;
    // const publicationStatus = (isDraft ? 'draft' : 'published');
    const publicationStatus = 'draft';

    this.props.submitIdea(userId, localTitle, localDescription, topics, areas, project, publicationStatus);
  }

  render() {
    const { formatMessage } = this.props.intl;
    const editorToolbarConfig = {
      options: ['inline', 'list', 'link'],
      inline: {
        options: ['bold', 'italic'],
      },
      list: {
        options: ['unordered', 'ordered'],
      },
    };

    return (
      <div>
        <WatchSagas sagas={sagas} />
        <PageContainer>
          <PageTitle>
            <FormattedMessage {...messages.pageTitle} />
          </PageTitle>

          <FormContainer>
            <Label value={formatMessage(messages.titleLabel)} htmlFor="title" />
            <InputWrapper>
              <Input
                type="text"
                id="title"
                value={this.state.title}
                placeholder={formatMessage(messages.titlePlaceholder)}
                onChange={this.handleTitleOnChange}
              />
            </InputWrapper>

            <Label value={formatMessage(messages.descriptionLabel)} />
            <EditorWrapper>
              <Editor
                value={this.state.description}
                placeholder={formatMessage(messages.descriptionPlaceholder)}
                onChange={this.handleEditorOnChange}
                toolbarConfig={editorToolbarConfig}
              />
            </EditorWrapper>

            <Label value={formatMessage(messages.topicsLabel)} />
            <MultipleSelectWrapper>
              <MultipleSelect
                value={this.state.topics}
                placeholder={formatMessage(messages.topicsPlaceholder)}
                options={this.getOptions(this.props.topics)}
                onChange={this.handleMultipleSelectOnChange('topics')}
                max={20}
              />
            </MultipleSelectWrapper>

            <Label value={formatMessage(messages.areasLabel)} />
            <MultipleSelectWrapper>
              <MultipleSelect
                value={this.state.areas}
                placeholder={formatMessage(messages.areasPlaceholder)}
                options={this.getOptions(this.props.areas)}
                onChange={this.handleMultipleSelectOnChange('areas')}
                max={2}
              />
            </MultipleSelectWrapper>

            <Label value={formatMessage(messages.projectsLabel)} />
            <MultipleSelectWrapper>
              <Dropdown
                scrolling
                selection
                fluid
                value={this.state.projects[0]}
                placeholder={formatMessage(messages.projectsPlaceholder)}
                options={this.getOptions(this.props.projects)}
                onChange={this.handleOnChange}
              />
            </MultipleSelectWrapper>

            <Label value={formatMessage(messages.imagesLabel)} />
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
