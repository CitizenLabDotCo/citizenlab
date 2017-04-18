/**
*
* VoteIdea
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Button } from 'components/Foundation';
import messages from './messages';

class VoteIdea extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    // provide this context to callbacks
    this.upVoteIdea = this.upVoteIdea.bind(this);
    this.downVoteIdea = this.downVoteIdea.bind(this);
  }

  upVoteIdea() {
    const { ideaId, userId, onVoteIdeaClick } = this.props;
    onVoteIdeaClick(ideaId, userId, 'up');
  }

  downVoteIdea() {
    const { ideaId, userId, onVoteIdeaClick } = this.props;
    onVoteIdeaClick(ideaId, userId, 'down');
  }

  render() {
    const { upVotes, downVotes, userId } = this.props;

    return (
      <div>
        <hr />
        <strong><FormattedMessage {...messages.header} /></strong>
        <div>
          {userId && <Button onClick={this.upVoteIdea}>
            +
          </Button>}
          {upVotes.length}
        </div>
        <div>
          {userId && <Button onClick={this.downVoteIdea}>
            -
          </Button>}
        </div>
        {downVotes.length}
      </div>
    );
  }
}

VoteIdea.propTypes = {
  ideaId: PropTypes.string.isRequired,
  userId: PropTypes.string,
  upVotes: PropTypes.any.isRequired,
  downVotes: PropTypes.any.isRequired,
  onVoteIdeaClick: PropTypes.func.isRequired,
};

export default styled(VoteIdea) `
  // no styling yet
`;
