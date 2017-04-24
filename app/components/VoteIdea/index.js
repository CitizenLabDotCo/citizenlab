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
    const { ideaId, onVoteIdeaClick } = this.props;
    onVoteIdeaClick(ideaId, 'up');
  }

  downVoteIdea() {
    const { ideaId, onVoteIdeaClick } = this.props;
    onVoteIdeaClick(ideaId, 'down');
  }

  render() {
    const { upVotes, downVotes, userId, submittingVote, ideaVoteSubmitError } = this.props;
    return (
      <div>
        <hr />
        <strong><FormattedMessage {...messages.header} /></strong>
        <div>
          {userId && !submittingVote && <Button onClick={this.upVoteIdea}>
            +
          </Button>}
          {upVotes.length}
        </div>
        <div>
          {userId && !submittingVote && <Button onClick={this.downVoteIdea}>
            -
          </Button>}
          {downVotes.length}
        </div>
        {ideaVoteSubmitError && <FormattedMessage {...messages.ideaVoteSubmitError} />}
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
  submittingVote: PropTypes.bool.isRequired,
  ideaVoteSubmitError: PropTypes.string,
};

export default styled(VoteIdea) `
  // no styling yet
`;
