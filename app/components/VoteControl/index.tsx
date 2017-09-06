import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import Icon from 'components/UI/Icon';
import { darken } from 'polished';
import { state, IStateStream } from 'services/state';
import { IStream } from 'utils/streams';
import styled from 'styled-components';
import { authUserStream } from 'services/auth';
import eventEmitter from 'utils/eventEmitter';
import { ideaStream, IIdea } from 'services/ideas';
import { userStream, IUser } from 'services/users';
import { votesStream, vote, IIdeaVote, IIdeaVoteData } from 'services/ideaVotes';

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
};
const FONT_SIZE = {
  small: 14,
  medium: 18,
  large: 23,
};
const GUTTER = {
  small: 3,
  medium: 5,
  large: 8,
};

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
`;

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
  ideaId: string;
  size: 'small' | 'medium' | 'large';
};

type State = {
  authUser: IUser | null,
  isAuthenticated: boolean;
  upvotesCount: number;
  downVotesCount: number;
  myVote: IIdeaVoteData | null;
};

export const namespace = 'VoteControl/index';

export default class Votes extends React.PureComponent<Props, State> {
  state$: IStateStream<State>;
  subscriptions: Rx.Subscription[];

  componentWillMount() {
    const { ideaId } = this.props;
    const instanceNamespace = `${namespace}/${ideaId}`;
    const initialState: State = {
      authUser: null,
      isAuthenticated: false,
      upvotesCount: 0,
      downVotesCount: 0,
      myVote: null
    };

    const authUser$ = authUserStream().observable;
    const isAuthenticated$ = authUser$.map(authUser => !_.isNull(authUser));
    const idea$ = ideaStream(ideaId).observable;
    const votes$ = votesStream(ideaId).observable;
    const upvotesCount$ = idea$.map(idea => idea.data.attributes.upvotes_count);
    const downVotesCount$ = idea$.map(idea => idea.data.attributes.downvotes_count);
    const myVote$ = Rx.Observable.combineLatest(authUser$, votes$).map(([authUser, votes]) => {
      if (authUser) {
        const myVote = _(votes.data).find(vote => vote.relationships.user.data.id === authUser.data.id);
        return (myVote ? myVote : null);
      }

      return null;
    });

    this.state$ = state.createStream<State>(instanceNamespace, instanceNamespace, initialState);

    this.subscriptions = [
      this.state$.observable.subscribe(state => this.setState(state)),

      Rx.Observable.combineLatest(
        authUser$,
        isAuthenticated$,
        upvotesCount$,
        downVotesCount$,
        myVote$
      ).subscribe(([authUser, isAuthenticated, upvotesCount, downVotesCount, myVote]) => {
        this.state$.next({ authUser, isAuthenticated, upvotesCount, downVotesCount, myVote });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

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

  onClickVote = (voteMode: 'up' | 'down') => {
    const { ideaId } = this.props;
    const { authUser, myVote } = this.state;

    if (authUser !== null) {
      const userId = authUser.data.id;
      vote(ideaId, voteMode);

      /*
      if (myVote === null || myVote.attributes.mode !== voteMode) {
        addVote(ideaId, { mode: voteMode });
      } else if (myVote.attributes.mode === voteMode) {
        deleteVote(myVote.id);
      } else if (myVote.attributes.mode !== voteMode) {
        deleteVote(myVote.id);
        addVote(ideaId, { mode: voteMode });
      }
      */
    } else {
      eventEmitter.emit(namespace, 'unauthenticatedVoteClick', ideaId);
    }
  }

  render() {
    const { size } = this.props;
    const { isAuthenticated, upvotesCount, downVotesCount, myVote } = this.state;
    const myVoteMode = (myVote ? myVote.attributes.mode : null);

    return (
      <VotesContainer>
        <UpvoteButton size={size} active={myVoteMode === 'up'} onClick={this.onClickUpvote}>
          <VoteIcon name="upvote" />
          <VoteCount>{upvotesCount}</VoteCount>
        </UpvoteButton>
        <DownvoteButton size={size} active={myVoteMode === 'down'} onClick={this.onClickDownvote}>
          <VoteIcon name="downvote" />
          <VoteCount>{downVotesCount}</VoteCount>
        </DownvoteButton>
      </VotesContainer>
    );
  }
}
