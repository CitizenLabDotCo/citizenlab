import React, { PureComponent, MouseEvent, KeyboardEvent } from 'react';
import { isString, get, isEmpty, includes } from 'lodash-es';
import {
  BehaviorSubject,
  Subscription,
  Observable,
  combineLatest,
  of,
} from 'rxjs';
import { filter, map, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// components
import ScreenReaderContent from './ScreenReaderContent';
import VoteButton from './VoteButton';

// services
import { authUserStream } from 'services/auth';
import {
  ideaByIdStream,
  IIdea,
  IdeaVotingDisabledReason,
} from 'services/ideas';
import { IUser } from 'services/users';
import { voteStream, addVote, deleteVote, TVoteMode } from 'services/ideaVotes';
import { projectByIdStream, IProject, IProjectData } from 'services/projects';
import {
  phaseStream,
  IPhase,
  IPhaseData,
  getLatestRelevantPhase,
} from 'services/phases';

// utils
import { openSignUpInModal } from 'components/SignUpIn/events';
import { openVerificationModal } from 'components/Verification/verificationModalEvents';

// style
import styled from 'styled-components';
import { isRtl } from 'utils/styleUtils';

// typings
import { IParticipationContextType } from 'typings';

type TSize = '1' | '2' | '3' | '4';
type TStyleType = 'border' | 'shadow';

const Container = styled.div`
  display: flex;
  align-items: center;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  * {
    user-select: none;
  }
`;

interface Props {
  ideaId: string;
  size: TSize;
  unauthenticatedVoteClick?: (voteMode: TVoteMode) => void;
  disabledVoteClick?: (disabled_reason?: IdeaVotingDisabledReason) => void;
  setRef?: (element: HTMLDivElement) => void;
  ariaHidden?: boolean;
  className?: string;
  styleType: TStyleType;
}

interface State {
  showVoteControl: boolean;
  authUser: IUser | null;
  upvotesCount: number;
  downvotesCount: number;
  voting: TVoteMode | null;
  votingAnimation: TVoteMode | null;
  myVoteId: string | null | undefined;
  myVoteMode: TVoteMode | null | undefined;
  idea: IIdea | null;
  participationContext: IProjectData | IPhaseData | null;
  participationContextId: string | null;
  participationContextType: IParticipationContextType | null;
  loaded: boolean;
}

class VoteControl extends PureComponent<Props & WithRouterProps, State> {
  voting$: BehaviorSubject<'up' | 'down' | null>;
  id$: BehaviorSubject<string | null>;
  subscriptions: Subscription[];
  upvoteElement: HTMLButtonElement | null;
  downvoteElement: HTMLButtonElement | null;

  static defaultProps = {
    ariaHidden: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      showVoteControl: false,
      authUser: null,
      upvotesCount: 0,
      downvotesCount: 0,
      voting: null,
      votingAnimation: null,
      myVoteId: undefined,
      myVoteMode: undefined,
      idea: null,
      participationContext: null,
      participationContextId: null,
      participationContextType: null,
      loaded: false,
    };
    this.voting$ = new BehaviorSubject(null);
    this.id$ = new BehaviorSubject(null);
    this.subscriptions = [];
    this.upvoteElement = null;
    this.downvoteElement = null;
  }

  componentDidMount() {
    const authUser$ = authUserStream().observable;
    const voting$ = this.voting$.pipe(distinctUntilChanged());
    const id$ = this.id$.pipe(
      filter((ideaId) => isString(ideaId)),
      distinctUntilChanged()
    ) as Observable<string>;

    this.id$.next(this.props.ideaId);
    this.upvoteElement?.addEventListener(
      'animationend',
      this.votingAnimationDone
    );
    this.downvoteElement?.addEventListener(
      'animationend',
      this.votingAnimationDone
    );

    const idea$ = id$.pipe(
      switchMap((ideaId: string) => {
        const idea$ = ideaByIdStream(ideaId).observable;

        return combineLatest([idea$, voting$]);
      }),
      filter(([_idea, voting]) => {
        return voting === null;
      }),
      map(([idea, _voting]) => {
        return idea;
      })
    );

    const myVote$ = combineLatest([authUser$, idea$]).pipe(
      switchMap(([authUser, idea]) => {
        if (
          authUser &&
          idea &&
          idea.data.relationships.user_vote &&
          idea.data.relationships.user_vote.data !== null
        ) {
          const voteId = idea.data.relationships.user_vote.data.id;
          const vote$ = voteStream(voteId).observable;

          return combineLatest([vote$, voting$]).pipe(
            filter(([_vote, voting]) => {
              return voting === null;
            }),
            map(([vote, _voting]) => {
              return vote;
            })
          );
        }

        return of(null);
      })
    );

    this.subscriptions = [
      voting$.subscribe((voting) => {
        this.setState((state) => ({
          voting,
          votingAnimation:
            voting !== null && state.voting === null
              ? voting
              : state.votingAnimation,
        }));
      }),

      idea$
        .pipe(
          switchMap((idea) => {
            let project$: Observable<IProject | null> = of(null);
            let phases$: Observable<IPhase[] | null> = of(null);
            const hasPhases = !isEmpty(
              get(idea.data.relationships.phases, 'data', null)
            );

            if (!hasPhases && idea.data.relationships.project.data) {
              project$ = projectByIdStream(
                idea.data.relationships.project.data.id
              ).observable;
            }

            if (hasPhases && idea.data.relationships.phases.data.length > 0) {
              phases$ = combineLatest(
                idea.data.relationships.phases.data.map(
                  (phase) => phaseStream(phase.id).observable
                )
              );
            }

            return combineLatest([project$, phases$, authUser$]).pipe(
              map(([project, phases, authUser]) => ({
                idea,
                project,
                phases,
                authUser,
              }))
            );
          })
        )
        .subscribe(({ idea, project, phases, authUser }) => {
          // votingActionDescriptor
          const ideaAttributes = idea.data.attributes;
          const votingActionDescriptor =
            ideaAttributes.action_descriptor.voting_idea;
          const votingEnabled = votingActionDescriptor.up.enabled;
          const votingDisabledReason = votingActionDescriptor.disabled_reason;
          const votingFutureEnabled = !!(
            votingActionDescriptor.up.future_enabled ||
            votingActionDescriptor.down.future_enabled
          );
          const cancellingEnabled = votingActionDescriptor.cancelling_enabled;

          // participationContext
          const ideaPhaseIds = idea?.data?.relationships?.phases?.data?.map(
            (item) => item.id
          );
          const ideaPhases = phases
            ?.filter((phase) => includes(ideaPhaseIds, phase.data.id))
            .map((phase) => phase.data);
          const isContinuousProject =
            project?.data.attributes.process_type === 'continuous';
          const latestRelevantIdeaPhase = ideaPhases
            ? getLatestRelevantPhase(ideaPhases)
            : null;
          const participationContextType = isContinuousProject
            ? 'project'
            : 'phase';
          const participationContextId = isContinuousProject
            ? project?.data.id || null
            : latestRelevantIdeaPhase?.id || null;
          const participationContext = isContinuousProject
            ? project?.data || null
            : latestRelevantIdeaPhase;
          const isPBContext =
            participationContext?.attributes.participation_method ===
            'budgeting';

          // Signed in
          const isSignedIn = !isNilOrError(authUser);
          const shouldSignIn =
            !votingEnabled &&
            (votingDisabledReason === 'not_signed_in' ||
              (votingDisabledReason === 'not_verified' && !isSignedIn));

          // Verification
          const shouldVerify =
            !votingEnabled &&
            votingDisabledReason === 'not_verified' &&
            isSignedIn;
          const verifiedButNotPermitted =
            !shouldVerify && votingDisabledReason === 'not_permitted';

          // Votes count
          const upvotesCount = ideaAttributes.upvotes_count;
          const downvotesCount = ideaAttributes.downvotes_count;

          const showVoteControl = !!(
            !isPBContext &&
            (votingEnabled ||
              shouldSignIn ||
              cancellingEnabled ||
              votingFutureEnabled ||
              upvotesCount > 0 ||
              downvotesCount > 0 ||
              shouldVerify ||
              verifiedButNotPermitted)
          );

          this.setState({
            idea,
            participationContext,
            participationContextId,
            participationContextType,
            showVoteControl,
            upvotesCount,
            downvotesCount,
            authUser,
            loaded: true,
          });
        }),

      myVote$.subscribe((myVote) => {
        this.setState({
          myVoteId: myVote ? myVote.data.id : null,
          myVoteMode: myVote ? myVote.data.attributes.mode : null,
        });
      }),
    ];
  }

  async componentDidUpdate() {
    this.id$.next(this.props.ideaId);
  }

  componentWillUnmount() {
    this.upvoteElement?.removeEventListener(
      'animationend',
      this.votingAnimationDone
    );
    this.downvoteElement?.removeEventListener(
      'animationend',
      this.votingAnimationDone
    );
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  votingAnimationDone = () => {
    this.setState({ votingAnimation: null });
  };

  onClickUpvote = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    this.vote('up');
  };

  onClickDownvote = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    this.vote('down');
  };

  vote = async (voteMode: 'up' | 'down') => {
    const {
      authUser,
      myVoteId,
      myVoteMode,
      voting,
      idea,
      participationContext,
      participationContextId,
      participationContextType,
    } = this.state;
    const { ideaId, disabledVoteClick } = this.props;
    const votingActionDescriptor =
      idea?.data.attributes.action_descriptor.voting_idea;
    const votingEnabled = {
      up: votingActionDescriptor?.up.enabled,
      down: votingActionDescriptor?.down.enabled,
    }[voteMode];
    const cancellingEnabled = votingActionDescriptor?.cancelling_enabled;
    const votingDisabledReason = {
      up: votingActionDescriptor?.up.disabled_reason,
      down: votingActionDescriptor?.down.disabled_reason,
    }[voteMode];

    const isSignedIn = !isNilOrError(authUser);
    const isTryingToUndoVote = !!(myVoteMode && voteMode === myVoteMode);
    const isVerified =
      !isNilOrError(authUser) && authUser.data.attributes.verified;

    if (!voting) {
      if (
        !isNilOrError(authUser) &&
        (votingEnabled || (cancellingEnabled && isTryingToUndoVote))
      ) {
        try {
          this.voting$.next(voteMode);

          const refetchIdeas =
            participationContext?.attributes?.upvoting_method === 'limited' ||
            participationContext?.attributes?.downvoting_method === 'limited';

          // Change vote (up -> down or down -> up)
          if (myVoteId && myVoteMode && myVoteMode !== voteMode) {
            this.setState((state) => ({
              upvotesCount:
                voteMode === 'up'
                  ? state.upvotesCount + 1
                  : state.upvotesCount - 1,
              downvotesCount:
                voteMode === 'down'
                  ? state.downvotesCount + 1
                  : state.downvotesCount - 1,
              myVoteMode: voteMode,
            }));
            await deleteVote(ideaId, myVoteId, refetchIdeas);
            await addVote(
              ideaId,
              { user_id: authUser.data.id, mode: voteMode },
              refetchIdeas
            );
          }

          // Cancel vote
          if (myVoteId && myVoteMode && myVoteMode === voteMode) {
            this.setState((state) => ({
              upvotesCount:
                voteMode === 'up' ? state.upvotesCount - 1 : state.upvotesCount,
              downvotesCount:
                voteMode === 'down'
                  ? state.downvotesCount - 1
                  : state.downvotesCount,
              myVoteMode: null,
            }));
            await deleteVote(ideaId, myVoteId, refetchIdeas);
          }

          // Vote
          if (!myVoteMode) {
            this.setState((state) => ({
              upvotesCount:
                voteMode === 'up' ? state.upvotesCount + 1 : state.upvotesCount,
              downvotesCount:
                voteMode === 'down'
                  ? state.downvotesCount + 1
                  : state.downvotesCount,
              myVoteMode: voteMode,
            }));
            await addVote(
              ideaId,
              { user_id: authUser.data.id, mode: voteMode },
              refetchIdeas
            );
          }

          await ideaByIdStream(ideaId).fetch();
          this.voting$.next(null);

          return 'success';
        } catch (error) {
          this.voting$.next(null);
          await ideaByIdStream(ideaId).fetch();
          throw 'error';
        }
      } else if (
        isSignedIn &&
        !isVerified &&
        votingDisabledReason === 'not_verified'
      ) {
        openVerificationModal();
      } else if (
        !isSignedIn &&
        (votingEnabled ||
          votingDisabledReason === 'not_verified' ||
          votingDisabledReason === 'not_signed_in' ||
          votingDisabledReason === 'not_permitted')
      ) {
        openSignUpInModal({
          verification: votingDisabledReason === 'not_verified',
          verificationContext:
            votingDisabledReason === 'not_verified' &&
            participationContextId &&
            participationContextType
              ? {
                  action: 'voting_idea',
                  id: participationContextId,
                  type: participationContextType,
                }
              : undefined,
          action: () => this.vote(voteMode),
        });
      } else if (votingDisabledReason) {
        disabledVoteClick?.(votingDisabledReason);
      }
    }

    return;
  };

  setContainerRef = (element: HTMLDivElement) => {
    this.props?.setRef?.(element);
  };

  setUpvoteRef = (element: HTMLButtonElement) => {
    this.upvoteElement = element;
  };

  setDownvoteRef = (element: HTMLButtonElement) => {
    this.downvoteElement = element;
  };

  render() {
    const { size, className, ariaHidden, styleType } = this.props;
    const {
      idea,
      showVoteControl,
      myVoteMode,
      votingAnimation,
      upvotesCount,
      downvotesCount,
    } = this.state;

    if (!isNilOrError(idea) && showVoteControl) {
      const votingDescriptor =
        idea.data.attributes.action_descriptor.voting_idea;
      // Only when downvoting is explicitly disabled,
      // we don't show the downvote button
      const showDownvote = votingDescriptor
        ? votingDescriptor.down.enabled === true ||
          (votingDescriptor.down.enabled === false &&
            votingDescriptor.down.disabled_reason !== 'downvoting_disabled')
        : true;

      return (
        <>
          <ScreenReaderContent
            upvotesCount={upvotesCount}
            downvotesCount={downvotesCount}
          />
          <Container
            className={[
              className,
              'e2e-vote-controls',
              myVoteMode === null ? 'neutral' : myVoteMode,
            ]
              .filter((item) => item)
              .join(' ')}
            aria-hidden={ariaHidden}
            ref={this.setContainerRef}
          >
            <VoteButton
              buttonVoteMode="up"
              userVoteMode={myVoteMode}
              onClick={this.onClickUpvote}
              setRef={this.setUpvoteRef}
              className={votingAnimation === 'up' ? 'voteClick' : ''}
              ariaHidden={ariaHidden}
              styleType={styleType}
              size={size}
              iconName="upvote"
              votesCount={upvotesCount}
              ideaId={idea.data.id}
            />

            {showDownvote && (
              <VoteButton
                buttonVoteMode="down"
                userVoteMode={myVoteMode}
                onClick={this.onClickDownvote}
                setRef={this.setDownvoteRef}
                className={votingAnimation === 'down' ? 'voteClick' : ''}
                ariaHidden={ariaHidden}
                styleType={styleType}
                size={size}
                iconName="downvote"
                votesCount={downvotesCount}
                ideaId={idea.data.id}
              />
            )}
          </Container>
        </>
      );
    }

    return null;
  }
}

export default withRouter<Props>(VoteControl);
