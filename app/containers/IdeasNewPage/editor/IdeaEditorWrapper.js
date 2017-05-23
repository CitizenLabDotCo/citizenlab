/**
*
* IdeaEditorWrapper
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Container, Grid, Button } from 'semantic-ui-react';
import MultiSelectT from 'components/MultiSelectT';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import FormattedMessageSegment from 'components/FormattedMessageSegment';

// import messages from './messages';
import IdeaEditor from './IdeaEditor';
import messages from '../messages';
import IdeaTitle, { TitleStatusWrapper } from './IdeaTitle';
import { makeSelectAreas, makeSelectTopics, selectSubmitIdea } from '../selectors';
import multiselectMap from '../multiselectMap';

class IdeaEditorWrapper extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  constructor() {
    super();

    // provide 'this' context
    this.storeTopics = this.storeTopics.bind(this);
    this.storeAreas = this.storeAreas.bind(this);
    this.saveDraft = this.saveDraft.bind(this);
  }

  storeTopics(topics) {
    this.props.storeTopics(topics);
  }

  storeAreas(areas) {
    this.props.storeAreas(areas);
  }

  saveDraft() {
    this.props.saveDraft();
  }

  render() {
    const { className, loading, loadError, stored, storeError, submitting, submitError, submitted, setTitle } = this.props;
    const { shortTitleError, longTitleError, titleLength } = this.props;
    const { saveDraft, storeIdea } = this.props;
    const { topics, areas, loadTopicsError, loadAreasError, loadingTopics, loadingAreas, invalidForm } = this.props;
    const { formatMessage } = this.props.intl;

    // refactor topics and areas to match format expected by Multiselect
    const topicsSelect = multiselectMap(topics);
    const areasSelect = multiselectMap(areas);

    return (
      <div>
        {loading && <FormattedMessageSegment message={messages.loading} />}
        {loadError && <FormattedMessageSegment message={messages.loadError} />}
        {stored && <FormattedMessageSegment message={messages.stored} />}
        {storeError && <FormattedMessageSegment message={messages.storeError} />}
        {submitting && <FormattedMessageSegment message={messages.submitting} />}
        {submitError && <FormattedMessageSegment message={messages.submitError} />}
        {invalidForm && <FormattedMessageSegment message={messages.invalidForm} />}
        {submitted && <FormattedMessageSegment message={messages.submitted} />}
        <Container>
          <Grid container>
            <Grid.Row columns={3}>
              <Grid.Column width={10}>
                <IdeaTitle
                  setTitle={setTitle}
                />
                <TitleStatusWrapper
                  short={shortTitleError}
                  long={longTitleError}
                  length={titleLength}
                />
              </Grid.Column>
              <Grid.Column width={4} textAlign="center">
                <Button onClick={saveDraft}>
                  <FormattedMessage {...messages.saveAsDraft} />
                </Button>
              </Grid.Column>
              <Grid.Column width={2} textAlign="center">
                <Button onClick={storeIdea}>
                  <FormattedMessage {...messages.publish} />
                </Button>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Grid columns={2}>
            <Grid.Row>
              <Grid.Column width={8} textAlign="center">
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
              </Grid.Column>
              <Grid.Column width={8} textAlign="center">
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
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Container>
        <div className={className}>
          <IdeaEditor
            saveDraft={this.saveDraft}
          />
        </div>
      </div>
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
  topics: PropTypes.any.isRequired,
  loadingTopics: PropTypes.bool.isRequired,
  loadTopicsError: PropTypes.string,
  areas: PropTypes.any.isRequired,
  loadingAreas: PropTypes.bool.isRequired,
  loadAreasError: PropTypes.string,
  storeTopics: PropTypes.func.isRequired,
  storeAreas: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  invalidForm: PropTypes.bool.isRequired,
};

const mapStateToProps = createStructuredSelector({
  ideasNewPageState: selectSubmitIdea,
  topics: makeSelectTopics(),
  areas: makeSelectAreas(),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { ideasNewPageState: pageState } = stateProps;
  const { intl, setTitle, saveDraft, storeIdea, storeTopics, storeAreas } = ownProps;

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

  const loadTopicsError = pageState.getIn(['topics', 'loadError']);
  const loadingTopics = pageState.getIn(['topics', 'loading']);

  const loadAreasError = pageState.getIn(['areas', 'loadError']);
  const loadingAreas = pageState.getIn(['areas', 'loading']);

  const invalidForm = pageState.getIn(['draft', 'invalidForm']);

  return {
    /*
     * specific selectors
     */
    ...stateProps,
    // -----------------
    /*
     * Props from store
     */
    loading, loadError,
    storeError, stored,
    submitting, submitError, submitted,
    title, longTitleError, shortTitleError, titleLength,
    loadTopicsError, loadingTopics,
    loadAreasError, loadingAreas,
    invalidForm,
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

  };
  /* eslint-enable */
};

export default styled(injectIntl(connect(mapStateToProps, null, mergeProps)(IdeaEditorWrapper)))`
  // none yet
`;
