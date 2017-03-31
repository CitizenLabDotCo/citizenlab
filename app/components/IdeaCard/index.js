/**
*
* IdeaCard
*
*/

import React, { PropTypes } from 'react';
import _ from 'lodash';

// import styled from 'styled-components';

// import { FormattedMessage } from 'react-intl';
// import messages from './messages';

class IdeaCard extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { idea } = this.props;
    // TODO enable eslint
    /* eslint-disable */
    // fix: Visible, non-interactive elements should not have mouse or keyboard event listeners
    return (
      <div className="card" onClick={this.props.onClick}>
        <div className="card-section">
          {!_.isEmpty(idea.attributes.images) && <img src={idea.attributes.images[0].medium} role="presentation"></img>}
          <h4>
            {idea.attributes.title_multiloc.en}
          </h4>
          <p>

          </p>
        </div>
      </div>


    );
  }
}

IdeaCard.propTypes = {
  idea: PropTypes.object,
  onClick: PropTypes.func,
};

export default IdeaCard;
