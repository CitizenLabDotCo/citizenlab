import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import styled from 'styled-components';
import { preprocess } from 'utils';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { EditorState, convertToRaw } from 'draft-js';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { injectTFunc } from 'utils/containers/t/utils';
import WatchSagas from 'containers/WatchSagas';
// import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
// import { API_PATH } from 'containers/App/constants';
import sagas from './sagas';
import { loadTopics, loadAreas, loadProjects, submitIdea } from './actions';
import { makeSelectTopics, makeSelectAreas, makeSelectProjects, makeSelectIdeaId } from './selectors';
import { makeSelectLocale } from '../LanguageProvider/selectors';
import { makeSelectCurrentUser } from '../../utils/auth/selectors';
import messages from './messages';
import Select from 'components/UI/Select';
import MultipleSelect from 'components/UI/MultipleSelect';
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import LocationInput from 'components/UI/LocationInput';
import Editor from 'components/UI/Editor';
import Button from 'components/UI/Button';
import Upload from 'components/UI/Upload';
import draftToHtml from 'draftjs-to-html';

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
  color: #444;
  font-size: 36px;
  font-weight: 500;
  margin-bottom: 20px;
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 580px;
`;

const FormElement = styled.div`
  width: 100%;
  margin-bottom: 42px;
`;

const EditorWrapper = styled.div`
  margin-bottom: 42px;
`;

class IdeasNewPage2 extends React.Component {
  constructor() {
    super();

    this.state = {
      title: '',
      description: EditorState.createEmpty(),
      selectedTopics: [],
      selectedAreas: [],
      selectedProject: null,
      location: '',
      images: [],
    };

    this.dropzone = null;
  }

  componentDidMount() {
    this.props.loadTopics();
    this.props.loadAreas();
    this.props.loadProjects();
    this.submitIdea();

    // autofocus the title input field on first render;
    if (this.titleInput) {
      this.titleInput.focus();
    }
  }

  getOptions(list) {
    const options = [];

    if (list && list.size && list.size > 0) {
      list.forEach((item) => {
        options.push({
          value: item.get('id'),
          label: this.props.tFunc(item.getIn(['attributes', 'title_multiloc']).toJS()),
        });
      });
    }

    return options;
  }

  handleTitleOnChange = (title) => {
    this.setState({ title });
  }

  handleDescriptionOnChange = (description) => {
    this.setState({ description });
  }

  handleTopicsOnChange = (selectedTopics) => {
    this.setState({ selectedTopics });
  }

  handleProjectOnChange = (selectedProject) => {
    this.setState({ selectedProject });
  }

  handleLocationOnChange = (location) => {
    this.setState({ location });
  }

  async getBase64(image) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.readAsDataURL(image);
    });
  }

  handleUploadOnAdd = async (image) => {
    const base64 = await this.getBase64(image);
    this.setState((state) => {
      const images = [...state.images, { ...image, base64 }];
      return { images };
    });
  };

  handleUploadOnRemove = (removedImage) => {
    this.setState((state) => {
      const images = state.images.filter((image) => image.preview !== removedImage.preview);
      return { images };
    });
  };

  handleSetRef = (element) => {
    this.titleInput = element;
  }

  removeImage = (removedImage) => (event) => {
    event.preventDefault();
    event.stopPropagation();

    this.setState((state) => {
      const images = state.images.filter((image) => image.preview !== removedImage.preview);
      return { images };
    });
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

    /*
    geocodeByAddress(this.state.address)
      .then(results => getLatLng(results[0]))
      .then(latLng => console.log('Success', latLng))
      .catch(error => console.error('Error', error))
    */
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
            <FormElement>
              <Input
                type="text"
                id="title"
                value={this.state.title}
                placeholder={formatMessage(messages.titlePlaceholder)}
                onChange={this.handleTitleOnChange}
                setRef={this.handleSetRef}
              />
            </FormElement>

            <Label value={formatMessage(messages.descriptionLabel)} />
            <EditorWrapper>
              <Editor
                value={this.state.description}
                placeholder={formatMessage(messages.descriptionPlaceholder)}
                onChange={this.handleDescriptionOnChange}
                toolbarConfig={editorToolbarConfig}
              />
            </EditorWrapper>

            <Label value={formatMessage(messages.topicsLabel)} />
            <FormElement>
              <MultipleSelect
                value={this.state.selectedTopics}
                placeholder={formatMessage(messages.topicsPlaceholder)}
                options={this.getOptions(this.props.topics)}
                onChange={this.handleTopicsOnChange}
                max={2}
              />
            </FormElement>

            <Label value={formatMessage(messages.projectsLabel)} />
            <FormElement>
              <Select
                clearable
                value={this.state.selectedProject}
                placeholder={formatMessage(messages.projectsPlaceholder)}
                options={this.getOptions(this.props.projects)}
                onChange={this.handleProjectOnChange}
              />
            </FormElement>

            <FormElement>
              <Label value={formatMessage(messages.locationLabel)} />
              <LocationInput
                value={this.state.location}
                placeholder={formatMessage(messages.locationPlaceholder)}
                onChange={this.handleLocationOnChange}
              />
            </FormElement>

            <FormElement>
              <Label value={formatMessage(messages.imageUploadLabel)} />
              <Upload
                multiple
                items={this.state.images}
                accept="image/jpg, image/jpeg, image/png, image/gif"
                maxSize={5000000}
                maxItems={5}
                placeholder={formatMessage(messages.imageUploadPlaceholder)}
                onAdd={this.handleUploadOnAdd}
                onRemove={this.handleUploadOnRemove}
              />
            </FormElement>

            <Button
              loading={false}
              size="2"
              text={formatMessage(messages.submit)}
              onClick={this.submitIdea}
            />
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
  ideaId: PropTypes.string,
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
  ideaId: makeSelectIdeaId(),
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  loadTopics,
  loadAreas,
  loadProjects,
  submitIdea,
}, dispatch);

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { locale, user, topics, areas, projects, ideaId } = stateProps;
  return {
    locale,
    user,
    topics,
    areas,
    projects,
    ideaId,
    ...dispatchProps,
    ...ownProps,
  };
};

export default injectTFunc(injectIntl(preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(IdeasNewPage2)));
