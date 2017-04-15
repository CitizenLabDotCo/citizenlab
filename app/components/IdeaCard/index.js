/**
*
* IdeaCard
*
*/

import React, { PropTypes } from 'react';
import _ from 'lodash';
import T from 'containers/T';
import styled from 'styled-components';

// import { FormattedMessage } from 'react-intl';
// import messages from './messages';

class IdeaCard extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { idea } = this.props;
    // TODO enable eslint
    /* eslint-disable */
    // fix: Visible, non-interactive elements should not have mouse or keyboard event listeners
    return (
      <div className={'card ' + this.props.className} onClick={this.props.onClick}>
        <div className="card-section">
          {!_.isEmpty(idea.attributes.images) && <img src={idea.attributes.images[0].medium} role="presentation"></img>}
          <h4>
            <T value={idea.attributes.title_multiloc}></T>
          </h4>
          <p>
            {idea.relationships.author.attributes.first_name}
            {idea.relationships.topics.data.map((topic) => <T key={topic.id} value={topic.attributes.title_multiloc}></T>)}
            {idea.relationships.areas.data.map((area) => <T key={area.id} value={area.attributes.title_multiloc}></T>)}
          </p>
        </div>
      </div>


    );
  }
}

IdeaCard.propTypes = {
  idea: PropTypes.object,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default styled(IdeaCard)`
  cursor: pointer;
`;
