import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import Icon from 'components/UI/Icon';

// services
import { authUserStream } from 'services/auth';
import { ideaByIdStream, IIdea } from 'services/ideas';
import { userStream, IUser } from 'services/users';
import { voteStream, votesStream, addVote, deleteVote, IIdeaVote, IIdeaVoteData } from 'services/ideaVotes';

// utils
import eventEmitter from 'utils/eventEmitter';

// style
import { darken } from 'polished';
import styled from 'styled-components';

const green = '#32B67A';
const red = '#FC3C2D';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const Vote: any = styled.div`
  width: 90px;
  display: flex;
  align-items: center;
`;

const VoteIconWrapper = styled.div`
  width: 55px;
  height: 55px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: solid 1px #e5e5e5;
`;

const VoteIcon = styled(Icon)`
  height: 19px;
  fill: #bdbdbd;
`;

const VoteCount = styled.div`
  color: #bdbdbd;
  font-size: 16px;
  font-weight: 300;
  margin-left: 5px;
`;

const Upvote = Vote.extend`
  ${VoteIconWrapper} {
    ${props => props.active && `
      border-color: ${green};
      background: ${green};
    `}
  }

  ${VoteIcon} {
    margin-bottom: 5px;
    ${props => props.active && `fill: #fff;`}
  }

  &:hover {
    ${VoteIconWrapper} {
      ${props => props.active ? `border-color: ${green};` : `border-color: #999`}
    }

    ${VoteIcon} {
      ${props => props.active ? `fill: #fff;` : `fill: #999`}
    }
  }
`;

const Downvote = Vote.extend`
  ${VoteIconWrapper} {
    ${props => props.active && `
      border-color: ${red};
      background: ${red};
    `}
  }

  ${VoteIcon} {
    margin-top: 5px;
    ${props => props.active && `fill: #fff;`}
  }

  &:hover {
    ${VoteIconWrapper} {
      ${props => props.active ? `border-color: ${red};` : `border-color: #999`}
    }

    ${VoteIcon} {
      ${props => props.active ? `fill: #fff;` : `fill: #999`}
    }
  }
`;

type Props = {
  ideaId: string;
};

type State = {
  authUser: IUser | null,
  upvotesCount: number;
  downvotesCount: number;
  myVoteId: string | null;
  myVoteMode: 'up' | 'down' | null;
  processing: boolean;
};

export default class Votes extends React.PureComponent<Props, State> {
  state: State;
  processing$: Rx.BehaviorSubject<boolean>;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      authUser: null,
      upvotesCount: 0,
      downvotesCount: 0,
      myVoteId: null,
      myVoteMode: null,
      processing: false
    };
    this.processing$ = new Rx.BehaviorSubject(false);
    this.subscriptions = [];
  }

  componentWillMount() {
    const { ideaId } = this.props;
    const authUser$ = authUserStream().observable;
    const idea$ = Rx.Observable.combineLatest(
      ideaByIdStream(ideaId).observable, 
      this.processing$
    ).filter(([idea, processing]) => {
      return processing === false;
    }).map(([idea, processing]) => {
      return idea;
    });
    const myVote$ = Rx.Observable.combineLatest(authUser$, idea$).switchMap(([authUser, idea]) => {
      if (authUser && idea && _.has(idea, 'data.relationships.user_vote.data') && idea.data.relationships.user_vote.data !== null) {
        const voteId = idea.data.relationships.user_vote.data.id;

        return Rx.Observable.combineLatest(
          voteStream(voteId).observable,
          this.processing$
        ).filter(([vote, processing]) => {
          return processing === false;
        }).map(([vote, processing]) => {
          return vote;
        });
      }

      return Rx.Observable.of(null);
    });

    this.subscriptions = [
      this.processing$.subscribe((processing) => this.setState({ processing })),

      idea$.subscribe((idea) => {
        const upvotesCount = idea.data.attributes.upvotes_count;
        const downvotesCount = idea.data.attributes.downvotes_count;
        this.setState({ upvotesCount, downvotesCount });
      }),

      authUser$.subscribe(authUser => {
        console.log('authUser:');
        console.log(authUser);
        this.setState({ authUser });
      }),

      myVote$.subscribe((myVote) => {
        if (myVote) {
          this.setState({ myVoteId: myVote.data.id, myVoteMode: myVote.data.attributes.mode });
        } else {
          this.setState({ myVoteId: null, myVoteMode: null });
        }
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

  onClickVote = async (voteMode: 'up' | 'down') => {
    const { authUser, myVoteId, myVoteMode } = this.state;
    const { ideaId } = this.props;

    if (authUser && !this.state.processing) {
      try {
        this.processing$.next(true);

        if (myVoteId && myVoteMode && myVoteMode !== voteMode) {
          this.setState((state) => ({
            upvotesCount: (voteMode === 'up' ? state.upvotesCount + 1 : state.upvotesCount - 1),
            downvotesCount: (voteMode === 'down' ? state.downvotesCount + 1 : state.downvotesCount - 1),
            myVoteMode: voteMode
          }));
          await deleteVote(ideaId, myVoteId);
          await addVote(ideaId, { user_id: authUser.data.id, mode: voteMode });
        }

        if (myVoteId && myVoteMode && myVoteMode === voteMode) {
          this.setState((state) => ({
            upvotesCount: (voteMode === 'up' ? state.upvotesCount - 1 : state.upvotesCount),
            downvotesCount: (voteMode === 'down' ? state.downvotesCount - 1 : state.downvotesCount),
            myVoteMode: null
          }));
          await deleteVote(ideaId, myVoteId);
        }

        if (!myVoteMode) {
          this.setState((state) => ({
            upvotesCount: (voteMode === 'up' ? state.upvotesCount + 1 : state.upvotesCount),
            downvotesCount: (voteMode === 'down' ? state.downvotesCount + 1 : state.downvotesCount),
            myVoteMode: voteMode
          }));
          await addVote(ideaId, { user_id: authUser.data.id, mode: voteMode });
        }

        await ideaByIdStream(ideaId).fetch();
        this.processing$.next(false);
      } catch (error) {
        console.log(error);
        this.processing$.next(false);
        await ideaByIdStream(ideaId).fetch();
      }
    }

    if (!authUser) {
      eventEmitter.emit(namespace, 'unauthenticatedVoteClick', ideaId);
    }
  }

  render() {
    const { upvotesCount, downvotesCount, myVoteMode } = this.state;

    return (
      <Container>
        <Upvote active={myVoteMode === 'up'} onClick={this.onClickUpvote}>
          <VoteIconWrapper><VoteIcon name="upvote-2" /></VoteIconWrapper>
          <VoteCount>{upvotesCount}</VoteCount>
        </Upvote>
        <Downvote active={myVoteMode === 'down'} onClick={this.onClickDownvote}>
          <VoteIconWrapper><VoteIcon name="downvote-2" /></VoteIconWrapper>
          <VoteCount>{downvotesCount}</VoteCount>
        </Downvote>
      </Container>
    );
  }
}
