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
    const { author, topics, areas } = idea.relationships;
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
            {author.attributes.first_name}
            {topics.data.map((topic) =>
              {topic && topic.attributes && <T key={topic.id} value={topic.attributes.title_multiloc}></T>}
            )}
            {areas.data.map((area) =>
              {area && area.attributes && <T key={area.id} value={area.attributes.title_multiloc}></T>}
            )}
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
