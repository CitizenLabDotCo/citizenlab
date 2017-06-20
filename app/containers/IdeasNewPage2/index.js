import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import styled from 'styled-components';
import { darken } from 'polished';
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
import Icon from 'components/Icon';
import draftToHtml from 'draftjs-to-html';
import Dropzone from 'react-dropzone';

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
  max-width: 580px;
`;

const FormElement = styled.div`
  width: 100%;
  margin-bottom: 40px;
`;

const EditorWrapper = styled.div`
  margin-bottom: 40px;
`;

const StyledDropzone = styled(Dropzone)`
  width: 100%;
  min-height: 120px;
  display: flex;
  border-radius: 5px;
  border: dashed 2px #999;
  padding: 15px;
  cursor: pointer;
  position: relative;
  background: transparent;

  &:hover {
    border-color: #000;
  }
`;

const UploadMessageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const UploadIcon = styled.div`
  height: 40px;
  margin-top: -10px;
  margin-bottom: 5px;

  svg {
    fill: #999;
  }
`;

const UploadMessage = styled.span`
    color: #999;
    font-size: 17px;
    font-weight: 300;
`;

const UploadedImage = styled.div`
  width: 150px;
  height: 120px;
  margin-right: 15px;
  border: solid 1px #999;
  border-radius: 5px;
  position: relative;
  background-size: cover;

  &:last-child {
    margin-right: 0px;
  }
`;

const RemoveUploadedImage = styled.div`
  width: 28px;
  height: 28px;
  position: absolute;
  top: -10px;
  right: -10px;
  z-index: 2;
  padding: 0px;
  border-radius: 50%;
  background: #f8f8f8;
  cursor: pointer;

  &:hover svg {
    fill: ${(props) => darken(0.15, (props.theme.accentFg || '#000'))};
  }

  svg {
    fill: ${(props) => props.theme.accentFg || '#777'};
  }
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

  handleAreasOnChange = (selectedAreas) => {
    this.setState({ selectedAreas });
  }

  handleProjectOnChange = (selectedProject) => {
    this.setState({ selectedProject });
  }

  handleLocationOnChange = (location) => {
    this.setState({ location });
  }

  handleOnDrop = (newImages) => {
    this.setState((state) => {
      const images = [...state.images, ...newImages];

      // convert to base64
      // const reader = new FileReader();
      // reader.onload = (event) => console.log(event.target.result);
      // reader.readAsDataURL(images[0]);

      return {
        images,
      };
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
      return {
        images,
      };
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
                max={20}
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
              <Label value={formatMessage(messages.imagesLabel)} />
              <StyledDropzone
                multiple
                accept="image/jpg, image/jpeg, image/png, image/gif"
                maxSize={2097152000}
                onDrop={this.handleOnDrop}
              >
                {!this.state.images || this.state.images.length < 1
                  ? (
                    <UploadMessageContainer>
                      <UploadIcon>
                        <Icon name="upload" />
                      </UploadIcon>
                      <UploadMessage>
                        Drop images here
                      </UploadMessage>
                    </UploadMessageContainer>
                  )
                  : this.state.images.map((image) => (
                    <UploadedImage
                      key={image.lastModified}
                      style={{ backgroundImage: `url(${image.preview})` }}
                    >
                      <RemoveUploadedImage onClick={this.removeImage(image)}>
                        <Icon name="close" />
                      </RemoveUploadedImage>
                    </UploadedImage>
                  ))
                }
              </StyledDropzone>
            </FormElement>

            <Button size="2" text={formatMessage(messages.submit)} onClick={this.submitIdea} />
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
