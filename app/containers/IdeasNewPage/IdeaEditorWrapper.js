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

export class IdeaEditorWrapper extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { loading, loadError, stored, storeError, submitting, submitError, submitted } = this.props;

    return (
      <div>
        {loading && <FormattedMessage {...messages.loading} />}
        {loadError && <FormattedMessage {...messages.loadError} />}
        {stored && <FormattedMessage {...messages.stored} />}
        {storeError && <FormattedMessage {...messages.storeError} />}
        {submitting && <FormattedMessage {...messages.submitting} />}
        {submitError && <FormattedMessage {...messages.submitError} />}
        {submitted && <FormattedMessage {...messages.submitted} />}

        <div className={this.props.className}>
          <IdeaEditor
            onEditorChange={this.props.storeDraftCopy}
            loadDraft={this.props.loadExistingDraft}
            {...this.props}
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
};

export default styled(IdeaEditorWrapper)`
  height: 550px;
  border-radius: 3px;
  background-color: #ffffff;
  box-shadow: 0 4px 8px 0 rgba(81, 96, 115, 0.18);
`;
