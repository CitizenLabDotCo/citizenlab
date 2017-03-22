/**
*
* IdeaEditorWrapper
*
*/

import React, { PropTypes } from 'react';
import styled from 'styled-components';
// import { FormattedMessage } from 'react-intl';

// import messages from './messages';
import IdeaEditor from './IdeaEditor';

export class IdeaEditorWrapper extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div className={this.props.className}>
        <IdeaEditor
          onEditorChange={this.props.storeDraftCopy}
          loadDraft={this.props.loadExistingDraft}
          {...this.props}
        />
      </div>
    );
  }
}

IdeaEditorWrapper.propTypes = {
  className: PropTypes.string,
  storeDraftCopy: PropTypes.func.isRequired,
  loadExistingDraft: PropTypes.func.isRequired,
};

export default styled(IdeaEditorWrapper)`
  height: 550px;
  border-radius: 3px;
  background-color: #ffffff;
  box-shadow: 0 4px 8px 0 rgba(81, 96, 115, 0.18);
`;
