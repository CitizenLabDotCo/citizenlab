/**
*
* SubmitIdeaForm
*
*/

import React, { PropTypes } from 'react';
import styled from 'styled-components';

// import { FormattedMessage } from 'react-intl';
// import messages from './messages';

class SubmitIdeaForm extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div className={this.props.className}>

      </div>
    );
  }
}

SubmitIdeaForm.propTypes = {
  className: PropTypes.string,
};

export default styled(SubmitIdeaForm)`
  height: 550px;
  border-radius: 3px;
  background-color: #ffffff;
  box-shadow: 0 4px 8px 0 rgba(81, 96, 115, 0.18);
`;
