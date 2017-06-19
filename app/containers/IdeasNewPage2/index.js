import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import styled from 'styled-components';
import { Button } from 'semantic-ui-react';
import { preprocess } from 'utils';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { EditorState, convertToRaw } from 'draft-js';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { injectTFunc } from 'utils/containers/t/utils';
import WatchSagas from 'containers/WatchSagas';
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { API_PATH } from 'containers/App/constants';
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
import draftToHtml from 'draftjs-to-html';
import Dropzone from 'react-dropzone';
// import DropzoneComponent from 'react-dropzone-component';
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

const FormElement = styled.div`
  width: 100%;
  margin-bottom: 40px;
`;

const EditorWrapper = styled.div`
  margin-bottom: 40px;
`;

/*
const StyledDropzone = styled(DropzoneComponent)`
  background: red;
  cursor: pointer;
  margin-bottom: 40px;
  background: transparent !important;
  border-width: 1.5px !important;
  border-color: #999 !important;

  &:hover {
    border-color: #000 !important;
  }

  .dz-message {
    color: #333;
    font-size: 16px;
    font-weight: 300;
    margin: 20px 0px;
  }
`;
*/

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

  handleAreasOnChange = (selectedAreas) => {
    this.setState({ selectedAreas });
  }

  handleProjectOnChange = (selectedProject) => {
    // console.log('selectedProject:');
    // console.log(selectedProject);
    this.setState({ selectedProject });
  }

  handleLocationOnChange = (location) => {
    this.setState({ location });
  }

  handleOnDrop = (images) => {
    console.log(images);
    this.setState({ images });
  };

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
                max={20}
              />
            </FormElement>

            {/*
            <Label value={formatMessage(messages.areasLabel)} />
            <FormElement>
              <MultipleSelect
                value={this.state.selectedAreas}
                placeholder={formatMessage(messages.areasPlaceholder)}
                options={this.getOptions(this.props.areas)}
                onChange={this.handleAreasOnChange}
                max={2}
              />
            </FormElement>
            */}

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

            <Label value={formatMessage(messages.imagesLabel)} />
            <Dropzone
              multiple
              accept="image/jpg, image/jpeg, image/png, image/gif"
              maxSize={2097152}
              onDrop={this.handleOnDrop}
            >
              <p>Try dropping some files here, or click to select files to upload.</p>
            </Dropzone>
            <div>{this.state.images.map((image, index) => <img width="100" key={index} alt="none" src={image.preview} />)}</div>

            {/*
            <StyledDropzone
              config={{
                iconFiletypes: ['.jpg', '.png', '.gif'],
                showFiletypeIcon: true,
                postUrl: `${API_PATH}/ideas/${this.props.ideaId}/images`,
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
            */}

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
