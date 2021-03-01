import React, { PureComponent } from 'react';
import { isString, get, isEmpty, last, sortBy } from 'lodash-es';
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

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { LiveMessage } from 'react-aria-live';

// components
import { Icon } from 'cl2-component-library';

// services
import { authUserStream } from 'services/auth';
import {
  ideaByIdStream,
  IIdea,
  IdeaVotingDisabledReason,
} from 'services/ideas';
import { IUser } from 'services/users';
import { voteStream, addVote, deleteVote } from 'services/ideaVotes';
import { projectByIdStream, IProject } from 'services/projects';
import { phaseStream, IPhase, getCurrentPhase } from 'services/phases';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import { openSignUpInModal } from 'components/SignUpIn/events';
import { openVerificationModal } from 'components/Verification/verificationModalEvents';

// style
import styled, { css, keyframes } from 'styled-components';
import { colors, fontSizes, defaultStyles, isRtl } from 'utils/styleUtils';
import { lighten } from 'polished';

interface IVoteComponent {
  active: boolean;
  enabled: boolean | null;
  compact: boolean;
}

const voteKeyframeAnimation = keyframes`
  from {
    transform: scale3d(1, 1, 1);
  }

  40% {
    transform: scale3d(1.25, 1.25, 1.25);
  }

  to {
    transform: scale3d(1, 1, 1);
  }
`;

const voteCompactKeyframeAnimation = keyframes`
  from {
    transform: scale3d(1, 1, 1);
  }

  40% {
    transform: scale3d(1.5, 1.5, 1.5);
  }

  to {
    transform: scale3d(1, 1, 1);
  }
`;

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

const VoteIconContainer = styled.div<{
  size: '1' | '2' | '3';
  votingEnabled: boolean | null;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1px;
  border-radius: 50%;
  transition: all 60ms ease-out;
  background-color: white;

  &.border {
    border: solid 1px ${lighten(0.2, colors.label)};
  }

  &.shadow {
    ${({ votingEnabled }) =>
      votingEnabled &&
      `
      box-shadow: ${defaultStyles.boxShadow};

      &:hover {
        box-shadow: ${defaultStyles.boxShadowHoverSmall};
      }
    `}
  }

  ${(props) =>
    !props.votingEnabled
      ? css`
          margin-left: 5px;
        `
      : css``}

  ${(props) =>
    props.size === '1' && props.votingEnabled
      ? css`
          width: 45px;
          height: 45px;
        `
      : css``}

  ${(props) =>
    props.size === '2' && props.votingEnabled
      ? css`
          width: 48px;
          height: 48px;
        `
      : css``}

  ${(props) =>
    props.size === '3' && props.votingEnabled
      ? css`
          width: 50px;
          height: 50px;
        `
      : css``}

    &.compact {
      border: none;
      ${(props) => {
        let size = `width: 24px; height: 24px;`;
        if (props.size === '2') {
          size = `width: 28px; height: 28px;`;
        } else if (props.size === '3') {
          size = `width: 32px; height: 32px;`;
        }
        return css`
          ${size}
        `;
      }}
    }
`;

const VoteIcon = styled(Icon)<{
  size: '1' | '2' | '3';
  enabled: boolean | null;
}>`
  width: 19px;
  height: 19px;
  fill: ${colors.label};
  transition: all 100ms ease-out;

  ${(props) =>
    props.size === '1'
      ? css`
          width: 18px;
          height: 18px;
        `
      : css``}

  ${(props) =>
    props.size === '2'
      ? css`
          width: 20px;
          height: 20px;
        `
      : css``}

  ${(props) =>
    props.size === '3'
      ? css`
          width: 21px;
          height: 21px;
        `
      : css``}
`;

const VoteCount = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-left: 5px;
  transition: all 100ms ease-out;

  &:not(.enabled) {
    margin-left: 3px;
  }
`;

const Vote = styled.button<IVoteComponent>`
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
  cursor: pointer;
  border: none;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  &:not(.compact).voteClick ${VoteIconContainer} {
    animation: ${css`
      ${voteKeyframeAnimation} 350ms
    `};
  }

  &.compact.voteClick ${VoteIconContainer} {
    animation: ${css`
      ${voteCompactKeyframeAnimation} 300ms
    `};
  }

  &:not(.enabled).compact {
    pointer-events: none;
  }

  &:not(.enabled) {
    ${VoteIconContainer} {
      width: auto;
      border: none;
      background: none;
    }

    ${VoteIcon} {
      opacity: 0.71;
      margin-right: 4px;
    }

    ${VoteCount} {
      opacity: 0.71;
    }
  }
`;

const Upvote = styled(Vote)`
  margin-right: 8px;

  &:not(.enabled) {
    ${VoteCount} {
      margin-right: 14px;

      &.compact {
        margin-right: 0px;
      }

      ${isRtl`
        margin-right: 5px;
        margin-left: 14px;
      `}
    }
  }

  ${VoteIconContainer} {
    ${(props) =>
      props.active &&
      `border-color: ${colors.clGreen}; background: ${colors.clGreen};`}
    &.compact {
      background: none;
    }
  }

  ${VoteIcon} {
    margin-bottom: 4px;

    ${({ active, enabled, compact }) => {
      if (!compact && active && enabled) {
        return css`
          fill: #fff;
        `;
      }

      if ((compact && active) || (!compact && active && !enabled)) {
        return css`
          fill: ${colors.clGreen};
        `;
      }

      return;
    }};
  }

  ${VoteCount} {
    min-width: 20px;
    margin-right: 5px;
    ${(props) => props.active && `color: ${colors.clGreen};`}
  }

  &:hover.enabled {
    ${VoteIconContainer} {
      ${(props) => !props.active && `border-color: ${colors.clGreen};`}
    }

    ${VoteIcon} {
      ${(props) => !props.active && `fill: ${colors.clGreen};`}
    }

    ${VoteCount} {
      ${(props) => !props.active && `color: ${colors.clGreen};`}
    }
  }
`;

const Downvote = styled(Vote)`
  &.compact {
    margin-right: 27px;
  }

  ${VoteIconContainer} {
    ${(props) =>
      props.active &&
      `border-color: ${colors.clRed}; background: ${colors.clRed};`}
    &.compact {
      background: none;
    }
  }

  ${VoteIcon} {
    margin-top: 4px;

    ${({ active, enabled, compact }) => {
      if (!compact && active && enabled) {
        return css`
          fill: #fff;
        `;
      }

      if ((compact && active) || (!compact && active && !enabled)) {
        return css`
          fill: ${colors.clRed};
        `;
      }

      return;
    }};
  }

  ${VoteCount} {
    ${(props) => props.active && `color: ${colors.clRed};`}
  }

  &:hover.enabled {
    ${VoteIconContainer} {
      ${(props) => !props.active && `border-color: ${colors.clRed};`}
    }

    ${VoteIcon} {
      ${(props) => !props.active && `fill: ${colors.clRed};`}
    }

    ${VoteCount} {
      ${(props) => !props.active && `color: ${colors.clRed};`}
    }
  }
`;

interface Props {
  ideaId: string;
  size: '1' | '2' | '3';
  unauthenticatedVoteClick?: (voteMode: 'up' | 'down') => void;
  disabledVoteClick?: (disabled_reason?: IdeaVotingDisabledReason) => void;
  ariaHidden?: boolean;
  className?: string;
  showDownvote: boolean;
  style: 'border' | 'shadow' | 'compact';
}

interface State {
  showVoteControl: boolean;
  authUser: IUser | null;
  upvotesCount: number;
  downvotesCount: number;
  voting: 'up' | 'down' | null;
  votingAnimation: 'up' | 'down' | null;
  myVoteId: string | null | undefined;
  myVoteMode: 'up' | 'down' | null | undefined;
  idea: IIdea | null;
  project: IProject | null;
  phases: IPhase[] | null | undefined;
  loaded: boolean;
}

class VoteControl extends PureComponent<
  Props & InjectedIntlProps & WithRouterProps,
  State
> {
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
      project: null,
      phases: undefined,
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

        return combineLatest(idea$, voting$);
      }),
      filter(([_idea, voting]) => {
        return voting === null;
      }),
      map(([idea, _voting]) => {
        return idea;
      })
    );

    const myVote$ = combineLatest(authUser$, idea$).pipe(
      switchMap(([authUser, idea]) => {
        if (
          authUser &&
          idea &&
          idea.data.relationships.user_vote &&
          idea.data.relationships.user_vote.data !== null
        ) {
          const voteId = idea.data.relationships.user_vote.data.id;
          const vote$ = voteStream(voteId).observable;

          return combineLatest(vote$, voting$).pipe(
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

            return combineLatest(project$, phases$, authUser$).pipe(
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
          const isSignedIn = !isNilOrError(authUser);
          const upvotesCount = idea.data.attributes.upvotes_count;
          const downvotesCount = idea.data.attributes.downvotes_count;
          const votingEnabled =
            idea.data.attributes.action_descriptor.voting_idea.enabled;
          const cancellingEnabled =
            idea.data.attributes.action_descriptor.voting_idea
              .cancelling_enabled;
          const votingDisabledReason =
            idea.data.attributes.action_descriptor.voting_idea.disabled_reason;
          const votingFutureEnabled =
            idea.data.attributes.action_descriptor.voting_idea.future_enabled;
          const projectProcessType = get(
            project,
            'data.attributes.process_type'
          );
          const projectParticipationMethod = get(
            project,
            'data.attributes.participation_method'
          );
          const pbProject =
            project &&
            projectProcessType === 'continuous' &&
            projectParticipationMethod === 'budgeting'
              ? project
              : null;
          const pbPhase =
            !pbProject && phases
              ? phases.find(
                  (phase) =>
                    phase.data.attributes.participation_method === 'budgeting'
                )
              : null;
          const pbPhaseIsActive =
            pbPhase &&
            pastPresentOrFuture([
              pbPhase.data.attributes.start_at,
              pbPhase.data.attributes.end_at,
            ]) === 'present';
          const lastPhase = !isNilOrError(phases)
            ? last(sortBy(phases, [(phase) => phase.data.attributes.end_at]))
            : null;
          const lastPhaseHasPassed = lastPhase
            ? pastPresentOrFuture([
                lastPhase.data.attributes.start_at,
                lastPhase.data.attributes.end_at,
              ]) === 'past'
            : false;
          const pbPhaseIsLast =
            pbPhase && lastPhase && lastPhase.data.id === pbPhase.data.id;
          const showBudgetControl = !!(
            pbProject ||
            (pbPhase &&
              (pbPhaseIsActive || (lastPhaseHasPassed && pbPhaseIsLast)))
          );
          const shouldSignIn =
            !votingEnabled &&
            (votingDisabledReason === 'not_signed_in' ||
              (votingDisabledReason === 'not_verified' && !isSignedIn));
          const shouldVerify =
            !votingEnabled &&
            votingDisabledReason === 'not_verified' &&
            isSignedIn;
          const verifiedButNotPermitted =
            !shouldVerify && votingDisabledReason === 'not_permitted';
          const showVoteControl = !!(
            !showBudgetControl &&
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
            project,
            phases,
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

  onClickUpvote = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    this.vote('up');
  };

  onClickDownvote = (event: React.MouseEvent<HTMLButtonElement>) => {
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
      project,
      phases,
    } = this.state;
    const { ideaId, disabledVoteClick } = this.props;
    const votingEnabled =
      idea?.data.attributes.action_descriptor.voting_idea.enabled;
    const cancellingEnabled =
      idea?.data.attributes.action_descriptor.voting_idea.cancelling_enabled;
    const votingDisabledReason =
      idea?.data.attributes.action_descriptor.voting_idea.disabled_reason;
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

          const currentPhase = getCurrentPhase(
            phases ? phases.map((phase) => phase.data) : null
          );
          const participationContext = project ? project.data : currentPhase;
          const refetchIdeas =
            participationContext?.attributes?.voting_method === 'limited';

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
        const currentPhase = getCurrentPhase(
          phases ? phases.map((phase) => phase.data) : null
        );
        const pcType = phases ? 'phase' : 'project';
        const pcId = phases ? currentPhase?.id : project?.data?.id;

        openSignUpInModal({
          verification: votingDisabledReason === 'not_verified',
          verificationContext: !!(
            votingDisabledReason === 'not_verified' &&
            pcId &&
            pcType
          )
            ? {
                action: 'voting_idea',
                id: pcId,
                type: pcType,
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

  setUpvoteRef = (element: HTMLButtonElement) => {
    this.upvoteElement = element;
  };

  setDownvoteRef = (element: HTMLButtonElement) => {
    this.downvoteElement = element;
  };

  removeFocus = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  render() {
    const {
      size,
      className,
      intl: { formatMessage },
      ariaHidden,
      showDownvote,
      style,
    } = this.props;
    const {
      idea,
      authUser,
      showVoteControl,
      myVoteMode,
      votingAnimation,
      upvotesCount,
      downvotesCount,
    } = this.state;
    const votingEnabled =
      idea?.data.attributes.action_descriptor.voting_idea.enabled;
    const cancellingEnabled =
      idea?.data.attributes.action_descriptor.voting_idea.cancelling_enabled;
    const votingDisabledReason =
      idea?.data.attributes.action_descriptor.voting_idea.disabled_reason;
    const isSignedIn = !isNilOrError(authUser);
    const isVerified =
      !isNilOrError(authUser) && authUser.data.attributes.verified;
    const upvotingEnabled =
      (myVoteMode !== 'up' && votingEnabled) ||
      (myVoteMode === 'up' && cancellingEnabled) ||
      (!isVerified && votingDisabledReason === 'not_verified') ||
      (!isSignedIn && votingDisabledReason === 'not_signed_in');
    const downvotingEnabled =
      (myVoteMode !== 'down' && votingEnabled) ||
      (myVoteMode === 'down' && cancellingEnabled) ||
      (!isVerified && votingDisabledReason === 'not_verified') ||
      (!isSignedIn && votingDisabledReason === 'not_signed_in');

    if (!showVoteControl) return null;

    const screenreaderContent = (
      <>
        <ScreenReaderOnly>
          <FormattedMessage
            {...messages.a11y_upvotesDownvotes}
            values={{ upvotesCount, downvotesCount }}
          />
        </ScreenReaderOnly>
        <LiveMessage
          message={formatMessage(messages.a11y_upvotesDownvotes, {
            upvotesCount,
            downvotesCount,
          })}
          aria-live="polite"
        />
      </>
    );

    return (
      <>
        {screenreaderContent}
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
          <Upvote
            active={myVoteMode === 'up'}
            onMouseDown={this.removeFocus}
            onClick={this.onClickUpvote}
            ref={this.setUpvoteRef}
            className={[
              'e2e-ideacard-upvote-button',
              votingAnimation === 'up' ? 'voteClick' : 'upvote',
              upvotingEnabled ? 'enabled' : 'disabled',
              myVoteMode === 'up' ? 'active' : '',
              style,
            ].join(' ')}
            enabled={upvotingEnabled}
            compact={style === 'compact'}
            tabIndex={ariaHidden ? -1 : 0}
          >
            <VoteIconContainer
              className={style}
              size={size}
              votingEnabled={upvotingEnabled}
            >
              <VoteIcon
                className={style}
                name="upvote"
                size={size}
                enabled={upvotingEnabled}
                ariaHidden
              />
              <ScreenReaderOnly>
                <FormattedMessage {...messages.upvote} />
              </ScreenReaderOnly>
            </VoteIconContainer>
            <VoteCount
              aria-hidden
              className={[votingEnabled ? 'enabled' : '', style].join(' ')}
            >
              {upvotesCount}
            </VoteCount>
          </Upvote>

          {showDownvote && (
            <Downvote
              active={myVoteMode === 'down'}
              onMouseDown={this.removeFocus}
              onClick={this.onClickDownvote}
              ref={this.setDownvoteRef}
              className={[
                'e2e-ideacard-downvote-button',
                votingAnimation === 'down' ? 'voteClick' : 'downvote',
                downvotingEnabled ? 'enabled' : 'disabled',
                style,
              ].join(' ')}
              enabled={downvotingEnabled}
              compact={style === 'compact'}
              tabIndex={ariaHidden ? -1 : 0}
            >
              <VoteIconContainer
                className={style}
                size={size}
                votingEnabled={downvotingEnabled}
              >
                <VoteIcon
                  name="downvote"
                  className={style}
                  size={size}
                  enabled={downvotingEnabled}
                  ariaHidden
                />
                <ScreenReaderOnly>
                  <FormattedMessage {...messages.downvote} />
                </ScreenReaderOnly>
              </VoteIconContainer>
              <VoteCount aria-hidden className={votingEnabled ? 'enabled' : ''}>
                {downvotesCount}
              </VoteCount>
            </Downvote>
          )}
        </Container>
      </>
    );
  }
}

export default withRouter<Props>(injectIntl(VoteControl));
