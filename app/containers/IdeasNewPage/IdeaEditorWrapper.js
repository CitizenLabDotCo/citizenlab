/**
*
* IdeaEditorWrapper
*
*/

import React, { PropTypes } from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';

// import messages from './messages';
import IdeaEditor from './IdeaEditor';
import messages from './messages';
import IdeaTitle from './IdeaTitle';

export class IdeaEditorWrapper extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { className, loading, loadError, stored, storeError, submitting, submitError, submitted, setTitle } = this.props;
    const { shortTitleError, longTitleError, titleLength } = this.props;
    const { storeDraftCopy, loadExistingDraft, content, attachments, images } = this.props;

    return (
      <div>
        {loading && <FormattedMessage {...messages.loading} />}
        {loadError && <FormattedMessage {...messages.loadError} />}
        {stored && <FormattedMessage {...messages.stored} />}
        {storeError && <FormattedMessage {...messages.storeError} />}
        {submitting && <FormattedMessage {...messages.submitting} />}
        {submitError && <FormattedMessage {...messages.submitError} />}
        {submitted && <FormattedMessage {...messages.submitted} />}

        <IdeaTitle
          setTitle={setTitle}
          short={shortTitleError}
          long={longTitleError}
          length={titleLength}
        />

        <div className={className}>
          <IdeaEditor
            onEditorChange={storeDraftCopy}
            loadDraft={loadExistingDraft}
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
  loadExistingDraft: PropTypes.func.isRequired,
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
};

export default styled(IdeaEditorWrapper)`
  height: 550px;
  border-radius: 3px;
  background-color: #ffffff;
  box-shadow: 0 4px 8px 0 rgba(81, 96, 115, 0.18);
`;
