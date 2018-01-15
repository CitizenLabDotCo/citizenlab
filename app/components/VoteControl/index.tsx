import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import Icon from 'components/UI/Icon';

// services
import { authUserStream } from 'services/auth';
import { ideaByIdStream, IIdea } from 'services/ideas';
import { userByIdStream, IUser } from 'services/users';
import { voteStream, votesStream, addVote, deleteVote, IIdeaVote, IIdeaVoteData } from 'services/ideaVotes';

// style
import { darken } from 'polished';
import styled, { css, keyframes } from 'styled-components';
import { media } from 'utils/styleUtils';

const green = '#32B67A';
const red = '#FC3C2D';

const vote = keyframes`
  from {
    transform: scale3d(1, 1, 1);
  }

  50% {
    transform: scale3d(1.2, 1.2, 1.2);
  }

  to {
    transform: scale3d(1, 1, 1);
  }
`;

const Container: any = styled.div`
  display: flex;
  align-items: center;

  * {
    user-select: none;
  }
`;

const VoteIconContainer: any = styled.div`
  width: 53px;
  height: 53px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: solid 1px #e0e0e0;
  transition: all 100ms ease-out;

  ${(props: any) => props.size === 'small' ? css`
    width: 47px;
    height: 47px;
  ` : css``}
`;

const VoteIcon: any = styled(Icon) `
  height: 19px;
  fill: #84939d;
  transition: all 100ms ease-out;
  ${(props: any) => props.enabled ? '' : 'opacity: 0.5;'}

  ${(props: any) => props.size === 'small' ? css`
    height: 16px;
  ` : css``}
`;

const VoteCount = styled.div`
  min-width: 20px;
  color: #84939d;
  font-size: 16px;
  font-weight: 300;
  margin-left: 6px;
  transition: all 100ms ease-out;
`;

const Vote: any = styled.div`
  display: flex;
  align-items: center;

  &.voteClick ${VoteIconContainer} {
    animation: ${vote} 250ms;
  }

  &:not(.enabled) ${VoteIconContainer} {
    border: none;
    background: none;
  }

`;

const Upvote = Vote.extend`
  margin-right: 12px;

  ${(props: any) => props.size === 'small' ? css`
    margin-right: 8px;

    ${media.smallPhone`
      margin-right: 4px;
    `}
  ` : css``}

  ${VoteIconContainer} {
    ${props => props.active && `border-color: ${green}; background: ${green};`}
  }

  ${VoteIcon} {
    margin-bottom: 4px;
    ${props => props.active && (props.enabled ? `fill: #fff;` : `fill: ${green}`)}
  }

  ${VoteCount} {
    ${props => props.active && `color: ${green};`}
  }

  &:hover.enabled {
    ${VoteIconContainer} {
      ${props => !props.active && `border-color: ${green};`}
    }

    ${VoteIcon} {
      ${props => !props.active && `fill: ${green};`}
    }

    ${VoteCount} {
      ${props => !props.active && `color: ${green};`}
    }
  }
`;

const Downvote = Vote.extend`
  ${VoteIconContainer} {
    ${props => props.active && `border-color: ${red}; background: ${red};`}
  }

  ${VoteIcon} {
    margin-top: 5px;
    ${props => props.active && (props.enabled ? `fill: #fff;` : `fill: ${red}`)}
  }

  ${VoteCount} {
    ${props => props.active && `color: ${red};`}
  }

  &:hover.enabled {
    ${VoteIconContainer} {
      ${props => !props.active && `border-color: ${red};`}
    }

    ${VoteIcon} {
      ${props => !props.active && `fill: ${red};`}
    }

    ${VoteCount} {
      ${props => !props.active && `color: ${red};`}
    }
  }
`;

type Props = {
  ideaId: string;
  unauthenticatedVoteClick?: () => void;
  disabledVoteClick?: () => void;
  size: 'small' | 'normal';
};

type State = {
  authUser: IUser | null,
  upvotesCount: number;
  downvotesCount: number;
  voting: 'up' | 'down' | null;
  votingAnimation: 'up' | 'down' | null;
  myVoteId: string | null;
  myVoteMode: 'up' | 'down' | null;
  votingEnabled: boolean | null;
  votingFutureEnabled: string | null;
  votingDisabledReason: string | null;
};

export default class VoteControl extends React.PureComponent<Props, State> {
  state: State;
  voting$: Rx.BehaviorSubject<'up' | 'down' | null>;
  subscriptions: Rx.Subscription[];
  upvoteElement: HTMLDivElement | null;
  downvoteElement: HTMLDivElement | null;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      authUser: null,
      upvotesCount: 0,
      downvotesCount: 0,
      voting: null,
      votingAnimation: null,
      myVoteId: null,
      myVoteMode: null,
      votingEnabled: null,
      votingFutureEnabled: null,
      votingDisabledReason: null,
    };
    this.voting$ = new Rx.BehaviorSubject(null);
    this.subscriptions = [];
    this.upvoteElement = null;
    this.downvoteElement = null;
  }

  componentWillMount() {
    const { ideaId } = this.props;
    const authUser$ = authUserStream().observable;

    const idea$ = Rx.Observable.combineLatest(
      ideaByIdStream(ideaId).observable,
      this.voting$
    ).filter(([idea, voting]) => {
      return voting === null;
    }).map(([idea, voting]) => {
      return idea;
    });

    const myVote$ = Rx.Observable.combineLatest(
      authUser$,
      idea$
    ).switchMap(([authUser, idea]) => {
      if (authUser && idea && _.has(idea, 'data.relationships.user_vote.data') && idea.data.relationships.user_vote.data !== null) {
        const voteId = idea.data.relationships.user_vote.data.id;

        return Rx.Observable.combineLatest(
          voteStream(voteId).observable,
          this.voting$
        ).filter(([vote, voting]) => {
          return voting === null;
        }).map(([vote, voting]) => {
          return vote;
        });
      }

      return Rx.Observable.of(null);
    });

    this.subscriptions = [
      this.voting$.subscribe((voting) => {
        this.setState((state) => ({
          voting,
          votingAnimation: (voting !== null && state.voting === null ? voting : state.votingAnimation)
        }));
      }),

      idea$.subscribe((idea) => {
        const upvotesCount = idea.data.attributes.upvotes_count;
        const downvotesCount = idea.data.attributes.downvotes_count;
        const votingEnabled = idea.data.relationships.action_descriptor.data.voting.enabled;
        const votingDisabledReason = idea.data.relationships.action_descriptor.data.voting.disabled_reason;
        const votingFutureEnabled = idea.data.relationships.action_descriptor.data.voting.future_enabled;
        this.setState({ upvotesCount, downvotesCount, votingEnabled, votingDisabledReason, votingFutureEnabled });
      }),

      authUser$.subscribe(authUser => this.setState({ authUser })),

      myVote$.subscribe((myVote) => {
        if (myVote) {
          this.setState({ myVoteId: myVote.data.id, myVoteMode: myVote.data.attributes.mode });
        } else {
          this.setState({ myVoteId: null, myVoteMode: null });
        }
      })
    ];
  }

  componentDidMount() {
    if (this.upvoteElement) {
      this.upvoteElement.addEventListener('animationend', this.votingAnimationDone);
    }

    if (this.downvoteElement) {
      this.downvoteElement.addEventListener('animationend', this.votingAnimationDone);
    }
  }

  componentWillUnmount() {
    if (this.upvoteElement) {
      this.upvoteElement.removeEventListener('animationend', this.votingAnimationDone);
    }

    if (this.downvoteElement) {
      this.downvoteElement.removeEventListener('animationend', this.votingAnimationDone);
    }

    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

	votingAnimationDone = () => {
		this.setState({ votingAnimation: null });
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
    const { authUser, myVoteId, myVoteMode, votingEnabled } = this.state;
    const { ideaId } = this.props;

    if (!votingEnabled) {
      this.props.disabledVoteClick && this.props.disabledVoteClick();
    } else if (!authUser) {
      this.props.unauthenticatedVoteClick && this.props.unauthenticatedVoteClick();
    } else if (authUser && this.state.voting === null) {
      try {
        this.voting$.next(voteMode);

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
        this.voting$.next(null);
      } catch (error) {
        this.voting$.next(null);
        await ideaByIdStream(ideaId).fetch();
      }
    }
  }

  setUpvoteRef = (element: HTMLDivElement) => {
    this.upvoteElement = element;
  }

  setDownvoteRef = (element: HTMLDivElement) => {
    this.downvoteElement = element;
  }

  hideVotes = () => {
    return !(
      this.state.votingEnabled ||
      this.state.votingFutureEnabled ||
      this.state.upvotesCount ||
      this.state.downvotesCount
    );
  }

  render() {
    const className = this.props['className'];
    const { size } = this.props;
    const { upvotesCount, downvotesCount, myVoteMode, voting, votingAnimation, votingEnabled, votingFutureEnabled, votingDisabledReason } = this.state;

    if (this.hideVotes()) return null;

    return (
      <Container className={`${className} e2e-vote-controls ${myVoteMode === null ? 'neutral' : myVoteMode} ${votingEnabled && 'enabled'}`}>
        <Upvote
          active={myVoteMode === 'up'}
          onClick={this.onClickUpvote}
          innerRef={this.setUpvoteRef}
          className={`${votingAnimation === 'up' ? 'voteClick' : 'upvote'} ${votingEnabled && 'enabled'}`}
          size={size}
          enabled={votingEnabled}
        >
          <VoteIconContainer size={size}>
            <VoteIcon name="upvote-2" size={size} enabled={votingEnabled} />
          </VoteIconContainer>
          <VoteCount>{upvotesCount}</VoteCount>
        </Upvote>
        <Downvote
          active={myVoteMode === 'down'}
          onClick={this.onClickDownvote}
          innerRef={this.setDownvoteRef}
          className={`${votingAnimation === 'down' ? 'voteClick' : 'downvote'} ${votingEnabled && 'enabled'}`}
          size={size}
          enabled={votingEnabled}
        >
          <VoteIconContainer size={size}>
            <VoteIcon name="downvote-2" size={size} enabled={votingEnabled} />
          </VoteIconContainer>
          <VoteCount>{downvotesCount}</VoteCount>
        </Downvote>
      </Container>
    );
  }
}
