/**
*
* IdeaCard
*
*/

import React, { PropTypes } from 'react';
// import styled from 'styled-components';

// import { FormattedMessage } from 'react-intl';
// import messages from './messages';

class IdeaCard extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { idea } = this.props;
    return (
      <div className="card">
        <div className="card-section">
          <h4>
            {idea.attributes.title_multiloc.en}
          </h4>
          <p>
It has an easy to override visual style, and is appropriately subdued.
</p>
        </div>
      </div>


    );
  }
}

IdeaCard.propTypes = {
  idea: PropTypes.object,
};

export default IdeaCard;
