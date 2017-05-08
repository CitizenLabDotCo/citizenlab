/**
*
* IdeaEditorWrapper
*
*/

import React, { PropTypes } from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Container, Segment, Grid, Button } from 'semantic-ui-react';
import MultiSelectT from 'components/MultiSelectT';

// import messages from './messages';
import IdeaEditor from './IdeaEditor';
import messages from './messages';
import IdeaTitle, { TitleStatusWrapper } from './IdeaTitle';

export class IdeaEditorWrapper extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  constructor() {
    super();

    // provide 'this' context
    this.storeTopics = this.storeTopics.bind(this);
    this.storeAreas = this.storeAreas.bind(this);
  }

  storeTopics(topics) {
    this.props.storeTopics(topics);
  }

  storeAreas(areas) {
    this.props.storeAreas(areas);
  }

  render() {
    const { className, loading, loadError, stored, storeError, submitting, submitError, submitted, setTitle } = this.props;
    const { shortTitleError, longTitleError, titleLength } = this.props;
    const { storeDraftCopy, content, saveDraft, storeIdea } = this.props;
    const { topics, areas, topicsLabel, areasLabel, topicsPlaceholder, areasPlaceholder, loadTopicsError, loadAreasError, loadingTopics, loadingAreas } = this.props;

    const FormattedMessageSegment = (props) => (
      <Segment>
        <FormattedMessage {...props.message} />
      </Segment>
    );

    // refactor topics and areas to match format expected by Multiselect
    const topicsSelect = (topics
      ? topics.toJS().map((topic) => ({
        value: topic.id,
        label: JSON.stringify(topic.attributes.title_multiloc),
      }))
      : []
    );
    const areasSelect = (areas
        ? areas.toJS().map((area) => ({
          value: area.id,
          label: JSON.stringify(area.attributes.title_multiloc),
        }))
        : []
    );

    return (
      <div>
        {loading && <FormattedMessageSegment message={messages.loading} />}
        {loadError && <FormattedMessageSegment message={messages.loadError} />}
        {stored && <FormattedMessageSegment message={messages.stored} />}
        {storeError && <FormattedMessageSegment message={messages.storeError} />}
        {submitting && <FormattedMessageSegment message={messages.submitting} />}
        {submitError && <FormattedMessageSegment message={messages.submitError} />}
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
                  placeholder={topicsPlaceholder}
                  optionLabel={topicsLabel}
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
                  placeholder={areasPlaceholder}
                  optionLabel={areasLabel}
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
            onEditorChange={storeDraftCopy}
            content={content}
          />
        </div>
      </div>
    );
  }
}

IdeaEditorWrapper.propTypes = {
  className: PropTypes.string,
  storeDraftCopy: PropTypes.func.isRequired,
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
  content: PropTypes.string,
  saveDraft: PropTypes.func.isRequired,
  storeIdea: PropTypes.func.isRequired,
  topics: PropTypes.any.isRequired,
  loadingTopics: PropTypes.bool.isRequired,
  loadTopicsError: PropTypes.string,
  areas: PropTypes.any.isRequired,
  loadingAreas: PropTypes.bool.isRequired,
  loadAreasError: PropTypes.string,
  topicsLabel: PropTypes.string.isRequired,
  areasLabel: PropTypes.string.isRequired,
  storeTopics: PropTypes.func.isRequired,
  storeAreas: PropTypes.func.isRequired,
  topicsPlaceholder: PropTypes.string.isRequired,
  areasPlaceholder: PropTypes.string.isRequired,
};

export default styled(IdeaEditorWrapper)`
  height: 550px;
  border-radius: 3px;
  background-color: #ffffff;
  box-shadow: 0 4px 8px 0 rgba(81, 96, 115, 0.18);
`;
