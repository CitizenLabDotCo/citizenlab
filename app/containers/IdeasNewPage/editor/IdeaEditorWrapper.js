import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Button, Checkbox, Form, Input, Radio, Select, TextArea } from 'semantic-ui-react'
import MultiSelectT from 'components/MultiSelectT';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import FormattedMessageSegment from 'components/FormattedMessageSegment';
import IdeaEditor from './IdeaEditor';
import messages from '../messages';
import IdeaTitle, { TitleStatusWrapper } from './IdeaTitle';
import { makeSelectAreas, makeSelectTopics, makeSelectProjects, selectSubmitIdea } from '../selectors';
import multiselectMap from '../multiselectMap';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { selectAuthDomain } from 'utils/auth/selectors';
import { bindActionCreators } from 'redux';
import { LOAD_AREAS_REQUEST } from 'resources/areas/constants';
import { LOAD_TOPICS_REQUEST } from 'resources/topics/constants';
import { LOAD_PROJECTS_REQUEST } from 'resources/projects/constants';

class IdeaEditorWrapper extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    // provide 'this' context
    this.storeTopics = this.storeTopics.bind(this);
    this.storeAreas = this.storeAreas.bind(this);
    this.storeProject = this.storeProject.bind(this);
    this.saveDraft = this.saveDraft.bind(this);
  }

  storeTopics(topics) {
    this.props.storeTopics(topics);
  }

  storeAreas(areas) {
    this.props.storeAreas(areas);
  }

  storeProject(projects) {
    this.props.storeProject(projects);
  }

  saveDraft() {
    this.props.saveDraft();
  }

  publishIdea = () => {
    // const { toChildView } = this.context;
    const { storeIdea } = this.props;
    // if (!userId) return toChildView();
    storeIdea();
    // this.props.cur();
  }

  render() {
    console.log(this.props.storeImage);
    const { storeImage, loading, loadError, stored, storeError, submitting, submitError, submitted, setTitle } = this.props;
    // const { shortTitleError, longTitleError, titleLength } = this.props;
    const { saveDraft } = this.props;
    const { topics, areas, projects, loadTopicsError, loadAreasError, loadProjectsError, loadingTopics, loadingAreas, loadingProjects, invalidForm } = this.props;
    const { formatMessage } = this.props.intl;

    // refactor topics and areas to match format expected by Multiselect
    const topicsSelect = multiselectMap(topics);
    const areasSelect = multiselectMap(areas);
    const projectsSelect = multiselectMap(projects);

    return (
      <Form>
        {loading && <FormattedMessageSegment message={messages.loading} />}
        {loadError && <FormattedMessageSegment message={messages.loadError} />}
        {stored && <FormattedMessageSegment message={messages.stored} />}
        {storeError && <FormattedMessageSegment message={messages.storeError} />}
        {submitting && <FormattedMessageSegment message={messages.submitting} />}
        {submitError && <FormattedMessageSegment message={messages.submitError} />}
        {invalidForm && <FormattedMessageSegment message={messages.invalidForm} />}
        {submitted && <FormattedMessageSegment message={messages.submitted} />}

        <Form.Group>
          <IdeaTitle setTitle={setTitle} />
        </Form.Group>

        {/*
        <Form.Group>
          <TitleStatusWrapper
            short={shortTitleError}
            long={longTitleError}
            length={titleLength}
          />
        </Form.Group>
        */}

        <Form.Group>
          {!(loadingTopics || loadTopicsError) && <MultiSelectT
            options={topicsSelect}
            maxSelectionLength={3}
            placeholder={formatMessage({ ...messages.topicsPlaceholder })}
            optionLabel={formatMessage({ ...messages.topicsLabel })}
            handleOptionsAdded={this.storeTopics}
          />}
          {loadTopicsError && <div>
            <FormattedMessage {...messages.loadTopicsError} /> - {loadTopicsError}
            {/* TODO: retry button with dispatch here? */}
          </div>}
          {loadingTopics && <FormattedMessage {...messages.loadingTopics} />}
        </Form.Group>

        <Form.Group>
          {!(loadingAreas || loadAreasError) && <MultiSelectT
            options={areasSelect}
            maxSelectionLength={3}
            placeholder={formatMessage({ ...messages.areasPlaceholder })}
            optionLabel={formatMessage({ ...messages.areasLabel })}
            handleOptionsAdded={this.storeAreas}
          />}
          {loadAreasError && <div>
            <FormattedMessage {...messages.loadAreasError} /> - {loadAreasError}
            {/* TODO: retry button with dispatch here? */}
          </div>}
          {loadingAreas && <FormattedMessage {...messages.loadingAreas} />}
        </Form.Group>

        <Form.Group>
          {!(loadingProjects || loadProjectsError) && <MultiSelectT
            options={projectsSelect}
            maxSelectionLength={1}
            singleSelection
            placeholder={formatMessage({ ...messages.projectsPlaceholder })}
            optionLabel={formatMessage({ ...messages.projectsLabel })}
            handleOptionsAdded={this.storeProject}
          />}
          {loadProjectsError && <div>
            <FormattedMessage {...messages.loadAreasError} /> - {loadProjectsError}
            {/* TODO: retry button with dispatch here? */}
          </div>}
          {loadingProjects && <FormattedMessage {...messages.loadingProjects} />}
        </Form.Group>

        <Form.Group>
          <IdeaEditor saveDraft={this.saveDraft} />
        </Form.Group>

        <Form.Group>
          <Button onClick={saveDraft}>
            <FormattedMessage {...messages.saveAsDraft} />
          </Button>

          <Button onClick={this.publishIdea}>
            <FormattedMessage {...messages.publish} />
          </Button>
        </Form.Group>

      </Form>
    );
  }
}

IdeaEditorWrapper.propTypes = {
  className: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  loadError: PropTypes.bool.isRequired,
  stored: PropTypes.bool.isRequired,
  storeError: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  submitError: PropTypes.bool.isRequired,
  submitted: PropTypes.bool.isRequired,
  shortTitleError: PropTypes.bool.isRequired,
  longTitleError: PropTypes.bool.isRequired,
  titleLength: PropTypes.number.isRequired,
  setTitle: PropTypes.func.isRequired,
  saveDraft: PropTypes.func.isRequired,
  storeIdea: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  invalidForm: PropTypes.bool.isRequired,
  // topics
  topics: ImmutablePropTypes.list.isRequired,
  loadingTopics: PropTypes.bool,
  loadTopicsError: PropTypes.bool,
  storeTopics: PropTypes.func.isRequired,
  // areas
  areas: ImmutablePropTypes.list.isRequired,
  loadingAreas: PropTypes.bool,
  loadAreasError: PropTypes.bool,
  storeAreas: PropTypes.func.isRequired,
  // projects
  projects: ImmutablePropTypes.list.isRequired,
  loadingProjects: PropTypes.bool,
  loadProjectsError: PropTypes.bool,
  storeProject: PropTypes.func.isRequired,
};

IdeaEditorWrapper.contextTypes = {
  toChildView: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  pageState: selectSubmitIdea,
  topics: makeSelectTopics(),
  areas: makeSelectAreas(),
  projects: makeSelectProjects(),
  currentUser: selectAuthDomain('id'),
  // here, rather than mergeProps, for correct re-render trigger
  loadingAreas: (state) => state.getIn(['tempState', LOAD_AREAS_REQUEST, 'loading']),
  loadAreasError: (state) => state.getIn(['tempState', LOAD_AREAS_REQUEST, 'error']),
  loadingTopics: (state) => state.getIn(['tempState', LOAD_TOPICS_REQUEST, 'loading']),
  loadTopicsError: (state) => state.getIn(['tempState', LOAD_TOPICS_REQUEST, 'error']),
  loadingProjects: (state) => state.getIn(['tempState', LOAD_PROJECTS_REQUEST, 'loading']),
  loadProjectsError: (state) => state.getIn(['tempState', LOAD_PROJECTS_REQUEST, 'error']),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { pageState } = stateProps;
  const { cur } = dispatchProps;
  const { intl, setTitle, saveDraft, storeIdea, storeTopics, storeAreas, storeProject } = ownProps;

  /* eslint-disable */
  const loading = pageState.getIn(['draft', 'loading']);
  const loadError = pageState.getIn(['draft', 'loadError']);
  const stored = pageState.getIn(['draft', 'stored']);
  const storeError = pageState.getIn(['draft', 'storeError']);
  const submitting = pageState.getIn(['draft', 'submitting']);
  const submitError = pageState.getIn(['draft', 'submitError']);
  const submitted = pageState.getIn(['draft', 'submitted']);
  const title = pageState.getIn(['draft', 'title']);
  const longTitleError = pageState.getIn(['draft', 'longTitleError']);
  const shortTitleError = pageState.getIn(['draft', 'shortTitleError']);
  const titleLength = pageState.getIn(['draft', 'titleLength']);
  const invalidForm = pageState.getIn(['draft', 'invalidForm']);

  return {
    cur,
    /*
     * specific selectors
     */
    ...stateProps,
    // -----------------
    /*
     * Props from store
     */
    // idea
    loading, loadError, storeError, stored, submitting, submitError, submitted,
    title, longTitleError, shortTitleError, titleLength, invalidForm,

    // areas, topics and projects
    ...stateProps,
    // -----------------
    /*
     * own props
     */
    intl,
    setTitle,
    saveDraft,
    storeIdea,
    storeTopics,
    storeAreas,
    storeProject,

  };
  /* eslint-enable */
};

const mapDispatchToProps = (dispatch) => bindActionCreators({ cur: () => ({ type: 'user.update.COMPLETE_USER_REGISTRATION' }) }, dispatch);


export default styled(injectIntl(connect(mapStateToProps, mapDispatchToProps, mergeProps)(IdeaEditorWrapper)))`
  // none yet
`;
