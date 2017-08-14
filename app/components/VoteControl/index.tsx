import * as React from 'react';
import styled from 'styled-components';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';
import { darken } from 'polished';
import Icon from 'components/UI/Icon';

import { selectIdea, selectUserVote } from './selectors';
import { ideaVoteRequest, cancelIdeaVoteRequest } from './actions';

const BACKGROUND = '#F8F8F8';
const FOREGROUND = '#6B6B6B';
const FOREGROUND_ACTIVE = '#FFFFFF';
const GREEN = '#32B67A';
const RED = '#FC3C2D';
const WIDTH = {
  small: 50,
  medium: 80,
  large: 100,
};
const HEIGHT = {
  small: 35,
  medium: 45,
  large: 57,
}
const FONT_SIZE = {
  small: 14,
  medium: 18,
  large: 23,
}
const GUTTER = {
  small: 3,
  medium: 5,
  large: 8,
}

const VotesContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const VoteButton: any = styled.button`
  cursor: pointer;
  background-color: ${BACKGROUND};
  width: ${props => WIDTH[(props as any).size]}px;
  height: ${props => HEIGHT[(props as any).size]}px;
  border-radius: 5px;
  font-size: ${props => FONT_SIZE[(props as any).size]}px;
  font-weight: 600;
  color: ${props => (props as any).active ? FOREGROUND_ACTIVE : FOREGROUND};
  margin-right: ${props => GUTTER[(props as any).size]}px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 100ms ease-in-out;
  outline: none;
`

const UpvoteButton = VoteButton.extend`
  ${props => props.active && `background: ${GREEN};`}
  &:hover {
    background-color: ${props => darken(0.1, props.active ? GREEN : BACKGROUND)};
  }
`;

const DownvoteButton = VoteButton.extend`
  ${props => props.active && `background: ${RED};`}
  &:hover {
    background-color: ${props => darken(0.1, props.active ? RED : BACKGROUND)};
  }
`;

const VoteIcon = styled(Icon)`
`;

const VoteCount = styled.div`
  margin-left: 6px;
`;

type Props = {
  upvotesCount: number,
  downvotesCount: number,
  userVoteMode: 'up' | 'down' | null | undefined,
  size?: 'small' | 'medium' | 'large',
  vote: (string) => void,
  cancelVote: () => void,
}

class Votes extends React.PureComponent<Props> {

  onClickUpvote = (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.onClickVote('up');
  }

  onClickDownvote = (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.onClickVote('down');
  }

  onClickVote = (mode) => {
    if (this.props.userVoteMode === mode){
      this.props.cancelVote();
    } else {
      this.props.vote(mode)
    }
  }

  render(){
    const { upvotesCount, downvotesCount, userVoteMode, size } = this.props;
    return (
      <VotesContainer>
        <UpvoteButton size={size} active={userVoteMode === 'up'} onClick={this.onClickUpvote}>
          <VoteIcon name="upvote" />
          <VoteCount>{upvotesCount}</VoteCount>
        </UpvoteButton>
        <DownvoteButton size={size} active={userVoteMode === 'down'} onClick={this.onClickDownvote}>
          <VoteIcon name="downvote" />
          <VoteCount>{downvotesCount}</VoteCount>
        </DownvoteButton>
      </VotesContainer>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  idea: selectIdea,
  userVote: selectUserVote,
});

const mapDispatchToProps = (dispatch, { ideaId }) => ({
  vote: (mode) => dispatch(ideaVoteRequest(ideaId, mode)),
  dispatch,
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { idea, userVote } = stateProps;
  const cancelVote = () => dispatchProps.dispatch(cancelIdeaVoteRequest(idea.get('id'), userVote.get('id')));
  return {
    ...ownProps,
    ...dispatchProps,
    cancelVote,
    upvotesCount: idea.getIn(['attributes','upvotes_count']),
    downvotesCount: idea.getIn(['attributes','downvotes_count']),
    userVoteMode: userVote && userVote.getIn(['attributes', 'mode']),
    size: ownProps.size || 'medium',
  };
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Votes);
