import React, { MouseEvent, KeyboardEvent, useState } from 'react';
import { includes } from 'lodash-es';

import { isNilOrError } from 'utils/helperUtils';

// components
import ScreenReaderContent from './ScreenReaderContent';
import VoteButton from './VoteButton';

// services
import { IdeaVotingDisabledReason } from 'services/ideas';
import { addVote, deleteVote, TVoteMode } from 'services/ideaVotes';
import { getLatestRelevantPhase } from 'services/phases';

// utils
import { openSignUpInModal } from 'events/openSignUpInModal';
import { openVerificationModal } from 'events/verificationModal';

// style
import styled from 'styled-components';
import { isRtl } from 'utils/styleUtils';

// typings
import { queryClient } from 'utils/cl-react-query/queryClient';
import ideasKeys from 'api/ideas/keys';
import useIdeaById from 'api/ideas/useIdeaById';
import useAuthUser from 'hooks/useAuthUser';
import useProject from 'hooks/useProject';
import useVote from 'api/votes/useVote';
import usePhases from 'hooks/usePhases';

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

// interface State {
//   showVoteControl: boolean;
//   authUser: IUser | null;
//   upvotesCount: number;
//   downvotesCount: number;
//   voting: TVoteMode | null;
//   votingAnimation: TVoteMode | null;
//   myVoteId: string | null | undefined;
//   myVoteMode: TVoteMode | null | undefined;
//   idea: IIdea | null;
//   participationContext: IProjectData | IPhaseData | null;
//   participationContextId: string | null;
//   participationContextType: IParticipationContextType | null;
//   loaded: boolean;
// }

const VoteControl = ({
  ariaHidden = false,
  ideaId,
  size,
  className,
  styleType,
  disabledVoteClick,
}: Props) => {
  const { data: idea } = useIdeaById(ideaId);
  const authUser = useAuthUser();
  const project = useProject({
    projectId: idea?.data.relationships.project.data.id,
  });
  const phases = usePhases(idea?.data.relationships.project.data.id);
  const { data: voteData } = useVote(
    idea?.data.relationships.user_vote?.data?.id
  );
  const [voting, setVoting] = useState(false);

  // voting$: BehaviorSubject<'up' | 'down' | null>;
  // id$: BehaviorSubject<string | null>;
  // subscriptions: Subscription[];

  // constructor(props: Props) {
  //   super(props);
  //   this.state = {
  //     showVoteControl: false,
  //     upvotesCount: 0,
  //     downvotesCount: 0,
  //     voting: null,
  //     votingAnimation: null,
  //     myVoteId: undefined,
  //     myVoteMode: undefined,
  //     participationContext: null,
  //     participationContextId: null,
  //     participationContextType: null,
  //     loaded: false,
  //   };
  //   this.voting$ = new BehaviorSubject(null);
  //   this.id$ = new BehaviorSubject(null);
  //   this.subscriptions = [];
  // }

  const voteId = authUser && idea?.data?.relationships?.user_vote?.data?.id;

  // const myVote$ = combineLatest([authUser$, idea$]).pipe(
  //   switchMap(([authUser, idea]) => {
  //     if (
  //       authUser &&
  //       idea &&
  //       idea.data.relationships.user_vote &&
  //       idea.data.relationships.user_vote.data !== null
  //     ) {
  //       const voteId = idea.data.relationships.user_vote.data.id;
  //       const vote$ = voteStream(voteId).observable;

  //       return combineLatest([vote$, voting$]).pipe(
  //         filter(([_vote, voting]) => {
  //           return voting === null;
  //         }),
  //         map(([vote, _voting]) => {
  //           return vote;
  //         })
  //       );
  //     }

  //     return of(null);
  //   })
  // );

  // this.subscriptions = [
  //   voting$.subscribe((voting) => {
  //     this.setState((state) => ({
  //       voting,
  //       votingAnimation:
  //         voting !== null && state.voting === null
  //           ? voting
  //           : state.votingAnimation,
  //     }));
  //   }),

  if (!idea) return null;

  const ideaAttributes = idea.data.attributes;
  const votingActionDescriptor = ideaAttributes.action_descriptor.voting_idea;
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
  const ideaPhases =
    !isNilOrError(phases) &&
    phases
      ?.filter((phase) => includes(ideaPhaseIds, phase.id))
      .map((phase) => phase);
  const isContinuousProject = project?.attributes.process_type === 'continuous';
  const latestRelevantIdeaPhase = ideaPhases
    ? getLatestRelevantPhase(ideaPhases)
    : null;
  const participationContextType = isContinuousProject ? 'project' : 'phase';
  const participationContextId = isContinuousProject
    ? project?.id || null
    : latestRelevantIdeaPhase?.id || null;
  const participationContext = isContinuousProject
    ? project || null
    : latestRelevantIdeaPhase;
  const isPBContext =
    participationContext?.attributes.participation_method === 'budgeting';

  // Signed in
  const isSignedIn = !isNilOrError(authUser);
  const shouldSignIn =
    !votingEnabled &&
    (votingDisabledReason === 'not_signed_in' ||
      (votingDisabledReason === 'not_verified' && !isSignedIn));

  // Verification
  const shouldVerify =
    !votingEnabled && votingDisabledReason === 'not_verified' && isSignedIn;
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

  const myVoteMode = voteData?.data.attributes.mode;

  //     idea$
  //       .pipe(
  //         switchMap((idea) => {
  //           let project$: Observable<IProject | null> = of(null);
  //           let phases$: Observable<IPhase[] | null> = of(null);
  //           const hasPhases = !isEmpty(idea.data.relationships.phases.data);

  //           if (!hasPhases && idea.data.relationships.project.data) {
  //             project$ = projectByIdStream(
  //               idea.data.relationships.project.data.id
  //             ).observable;
  //           }

  //           if (hasPhases && idea.data.relationships.phases.data.length > 0) {
  //             phases$ = combineLatest(
  //               idea.data.relationships.phases.data.map(
  //                 (phase) => phaseStream(phase.id).observable
  //               )
  //             );
  //           }

  //           return combineLatest([project$, phases$, authUser$]).pipe(
  //             map(([project, phases, authUser]) => ({
  //               idea,
  //               project,
  //               phases,
  //               authUser,
  //             }))
  //           );
  //         })
  //       )
  //       .subscribe(({ idea, project, phases, authUser }) => {
  //         // votingActionDescriptor
  //         const ideaAttributes = idea.data.attributes;
  //         const votingActionDescriptor =
  //           ideaAttributes.action_descriptor.voting_idea;
  //         const votingEnabled = votingActionDescriptor.up.enabled;
  //         const votingDisabledReason = votingActionDescriptor.disabled_reason;
  //         const votingFutureEnabled = !!(
  //           votingActionDescriptor.up.future_enabled ||
  //           votingActionDescriptor.down.future_enabled
  //         );
  //         const cancellingEnabled = votingActionDescriptor.cancelling_enabled;

  //         // participationContext
  //         const ideaPhaseIds = idea?.data?.relationships?.phases?.data?.map(
  //           (item) => item.id
  //         );
  //         const ideaPhases = phases
  //           ?.filter((phase) => includes(ideaPhaseIds, phase.data.id))
  //           .map((phase) => phase.data);
  //         const isContinuousProject =
  //           project?.data.attributes.process_type === 'continuous';
  //         const latestRelevantIdeaPhase = ideaPhases
  //           ? getLatestRelevantPhase(ideaPhases)
  //           : null;
  //         const participationContextType = isContinuousProject
  //           ? 'project'
  //           : 'phase';
  //         const participationContextId = isContinuousProject
  //           ? project?.data.id || null
  //           : latestRelevantIdeaPhase?.id || null;
  //         const participationContext = isContinuousProject
  //           ? project?.data || null
  //           : latestRelevantIdeaPhase;
  //         const isPBContext =
  //           participationContext?.attributes.participation_method ===
  //           'budgeting';

  //         // Signed in
  //         const isSignedIn = !isNilOrError(authUser);
  //         const shouldSignIn =
  //           !votingEnabled &&
  //           (votingDisabledReason === 'not_signed_in' ||
  //             (votingDisabledReason === 'not_verified' && !isSignedIn));

  //         // Verification
  //         const shouldVerify =
  //           !votingEnabled &&
  //           votingDisabledReason === 'not_verified' &&
  //           isSignedIn;
  //         const verifiedButNotPermitted =
  //           !shouldVerify && votingDisabledReason === 'not_permitted';

  //         // Votes count
  //         const upvotesCount = ideaAttributes.upvotes_count;
  //         const downvotesCount = ideaAttributes.downvotes_count;

  //         const showVoteControl = !!(
  //           !isPBContext &&
  //           (votingEnabled ||
  //             shouldSignIn ||
  //             cancellingEnabled ||
  //             votingFutureEnabled ||
  //             upvotesCount > 0 ||
  //             downvotesCount > 0 ||
  //             shouldVerify ||
  //             verifiedButNotPermitted)
  //         );

  //         this.setState({
  //           idea,
  //           participationContext,
  //           participationContextId,
  //           participationContextType,
  //           showVoteControl,
  //           upvotesCount,
  //           downvotesCount,
  //           authUser,
  //           loaded: true,
  //         });
  //       }),

  //     myVote$.subscribe((myVote) => {
  //       this.setState({
  //         myVoteId: myVote ? myVote.data.id : null,
  //         myVoteMode: myVote ? myVote.data.attributes.mode : null,
  //       });
  //     }),
  //   ];
  // }

  // async componentDidUpdate() {
  //   this.id$.next(this.props.ideaId);
  // }

  // componentWillUnmount() {
  //   this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  // }

  // const votingAnimationDone = () => {
  //   this.setState({ votingAnimation: null });
  // };

  const onClickUpvote = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    vote('up');
  };

  const onClickDownvote = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    vote('down');
  };

  const vote = async (voteMode: 'up' | 'down') => {
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
    const isVerified = !isNilOrError(authUser) && authUser.attributes.verified;

    if (!voting) {
      if (
        !isNilOrError(authUser) &&
        (votingEnabled || (cancellingEnabled && isTryingToUndoVote))
      ) {
        try {
          const refetchIdeas =
            participationContext?.attributes?.upvoting_method === 'limited' ||
            participationContext?.attributes?.downvoting_method === 'limited';

          // Change vote (up -> down or down -> up)
          if (voteId && myVoteMode !== voteMode) {
            await deleteVote(voteId, refetchIdeas);
            await addVote(
              ideaId,
              { user_id: authUser.id, mode: voteMode },
              refetchIdeas
            );
          }

          // Cancel vote
          if (voteId && myVoteMode === voteMode) {
            await deleteVote(voteId, refetchIdeas);
          }

          // Add vote
          if (!voteId) {
            await addVote(
              ideaId,
              { user_id: authUser.id, mode: voteMode },
              refetchIdeas
            );
          }
          queryClient.invalidateQueries(ideasKeys.itemId(ideaId));
          return 'success';
        } catch (error) {
          queryClient.invalidateQueries(ideasKeys.itemId(ideaId));
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
          action: () => vote(voteMode),
        });
      } else if (votingDisabledReason) {
        disabledVoteClick?.(votingDisabledReason);
      }
    }

    return;
  };

  if (idea && showVoteControl) {
    const votingDescriptor = idea.data.attributes.action_descriptor.voting_idea;
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
        >
          <VoteButton
            buttonVoteMode="up"
            userVoteMode={myVoteMode}
            onClick={onClickUpvote}
            //     className={votingAnimation === 'up' ? 'voteClick' : ''}
            ariaHidden={ariaHidden}
            styleType={styleType}
            size={size}
            iconName="vote-up"
            votesCount={upvotesCount}
            ideaId={idea.data.id}
          />

          {showDownvote && (
            <VoteButton
              buttonVoteMode="down"
              userVoteMode={myVoteMode}
              onClick={onClickDownvote}
              // className={votingAnimation === 'down' ? 'voteClick' : ''}
              ariaHidden={ariaHidden}
              styleType={styleType}
              size={size}
              iconName="vote-down"
              votesCount={downvotesCount}
              ideaId={idea.data.id}
            />
          )}
        </Container>
      </>
    );
  }

  return null;
};

export default VoteControl;
