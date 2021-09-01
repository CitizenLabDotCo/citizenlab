import React, { PureComponent } from 'react';
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
import { projectByIdStream, IProject, IProjectData } from 'services/projects';
import {
  phaseStream,
  IPhase,
  IPhaseData,
  getLatestRelevantPhase,
} from 'services/phases';

// utils
import { ScreenReaderOnly } from 'utils/a11y';
import { openSignUpInModal } from 'components/SignUpIn/events';
import { openVerificationModal } from 'components/Verification/verificationModalEvents';

// style
import styled, { css, keyframes } from 'styled-components';
import { colors, fontSizes, defaultStyles, isRtl } from 'utils/styleUtils';
import { lighten } from 'polished';

// typings
import { IParticipationContextType } from 'typings';

interface IVoteComponent {
  active: boolean;
  enabled: boolean | null;
}

type TSize = '1' | '2' | '3' | '4';
type TStyleType = 'border' | 'shadow';

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
  size: TSize;
  votingEnabled: boolean | null;
  styleType: TStyleType;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1px;
  border-radius: 50%;
  transition: all 60ms ease-out;
  background-color: white;

  ${({ styleType }) => {
    return (
      styleType === 'border' &&
      css`
        border: solid 1px ${lighten(0.2, colors.label)};
      `
    );
  }}


  ${({ styleType, votingEnabled }) => {
    return (
      styleType === 'shadow' &&
      votingEnabled &&
      css`
        box-shadow: ${defaultStyles.boxShadow};
        &:hover {
          box-shadow: ${defaultStyles.boxShadowHoverSmall};
        }
      `
    );
  }}

  ${({ votingEnabled, size }) => {
    if (votingEnabled) {
      if (size === '1') {
        return css`
          width: 35px;
          height: 35px;
        `;
      }

      if (size === '2') {
        return css`
          width: 45px;
          height: 45px;
        `;
      }

      if (size === '3') {
        return css`
          width: 48px;
          height: 48px;
        `;
      }

      if (size === '4') {
        return css`
          width: 50px;
          height: 50px;
        `;
      }
    }

    return css`
      margin-left: 5px;
    `;
  }}
`;

const VoteIcon = styled(Icon)<{
  size: TSize;
  enabled: boolean | null;
}>`
  width: 19px;
  height: 19px;
  fill: ${colors.label};
  transition: all 100ms ease-out;

  ${(props) =>
    props.size === '1'
      ? css`
          width: 17px;
          height: 17px;
        `
      : css``}

  ${(props) =>
    props.size === '2'
      ? css`
          width: 18px;
          height: 18px;
        `
      : css``}

  ${(props) =>
    props.size === '3'
      ? css`
          width: 20px;
          height: 20px;
        `
      : css``}

  ${(props) =>
    props.size === '4'
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

  &.voteClick ${VoteIconContainer} {
    animation: ${css`
      ${voteKeyframeAnimation} 350ms
    `};
  }

  &:not(.enabled) {
    ${VoteIconContainer} {
      width: auto;
      border: none;
      background: none;
    }

    ${VoteIcon} {
      margin-right: 4px;
    }
  }
`;

const Upvote = styled(Vote)`
  margin-right: 8px;

  &:not(.enabled) {
    ${VoteCount} {
      ${isRtl`
        margin-right: 5px;
      `}
    }
  }

  ${VoteIconContainer} {
    ${(props) =>
      props.active &&
      `border-color: ${colors.clGreen}; background: ${colors.clGreen};`}
  }

  ${VoteIcon} {
    margin-bottom: 4px;

    ${({ active, enabled }) => {
      if (active && enabled) {
        return css`
          fill: #fff;
        `;
      }

      if (active && !enabled) {
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
      ${(props) => !props.active && `border: 1px solid ${colors.clGreen};`}
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
  ${VoteIconContainer} {
    ${(props) =>
      props.active &&
      `border-color: ${colors.clRed}; background: ${colors.clRed};`}
  }

  ${VoteIcon} {
    margin-top: 4px;

    ${({ active, enabled }) => {
      if (active && enabled) {
        return css`
          fill: #fff;
        `;
      }

      if (active && !enabled) {
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
      ${(props) => !props.active && `border: 1px solid ${colors.clRed};`}
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
  size: TSize;
  unauthenticatedVoteClick?: (voteMode: 'up' | 'down') => void;
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
  voting: 'up' | 'down' | null;
  votingAnimation: 'up' | 'down' | null;
  myVoteId: string | null | undefined;
  myVoteMode: 'up' | 'down' | null | undefined;
  idea: IIdea | null;
  participationContext: IProjectData | IPhaseData | null;
  participationContextId: string | null;
  participationContextType: IParticipationContextType | null;
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
          const isContinuousProject =
            project?.data.attributes.process_type === 'continuous';
          const ideaPhaseIds = idea?.data?.relationships?.phases?.data?.map(
            (item) => item.id
          );
          const ideaPhases = phases
            ?.filter((phase) => includes(ideaPhaseIds, phase.data.id))
            .map((phase) => phase.data);
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
      participationContext,
      participationContextId,
      participationContextType,
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

  removeFocus = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  render() {
    const {
      size,
      className,
      intl: { formatMessage },
      ariaHidden,
      styleType,
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
    const votingDescriptor =
      idea?.data.attributes.action_descriptor.voting_idea;
    const votingEnabled = votingDescriptor?.enabled;
    const cancellingEnabled = votingDescriptor?.cancelling_enabled;
    const votingDisabledReason = votingDescriptor?.disabled_reason;
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
    // if a project is inactive (archived), downvoting_enabled is
    // null, hence the boolean check
    const showDownvote =
      typeof votingDescriptor?.downvoting_enabled === 'boolean'
        ? votingDescriptor?.downvoting_enabled
        : true;

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
          ref={this.setContainerRef}
        >
          <Upvote
            active={myVoteMode === 'up'}
            enabled={upvotingEnabled}
            onMouseDown={this.removeFocus}
            onClick={this.onClickUpvote}
            ref={this.setUpvoteRef}
            className={[
              'e2e-ideacard-upvote-button',
              votingAnimation === 'up' ? 'voteClick' : 'upvote',
              upvotingEnabled ? 'enabled' : 'disabled',
              myVoteMode === 'up' ? 'active' : '',
            ].join(' ')}
            tabIndex={ariaHidden ? -1 : 0}
          >
            <VoteIconContainer
              styleType={styleType}
              size={size}
              votingEnabled={upvotingEnabled}
            >
              <VoteIcon name="upvote" size={size} enabled={upvotingEnabled} />
              <ScreenReaderOnly>
                <FormattedMessage {...messages.upvote} />
              </ScreenReaderOnly>
            </VoteIconContainer>
            <VoteCount
              aria-hidden
              className={[votingEnabled ? 'enabled' : ''].join(' ')}
            >
              {upvotesCount}
            </VoteCount>
          </Upvote>

          {showDownvote && (
            <Downvote
              active={myVoteMode === 'down'}
              enabled={downvotingEnabled}
              onMouseDown={this.removeFocus}
              onClick={this.onClickDownvote}
              ref={this.setDownvoteRef}
              className={[
                'e2e-ideacard-downvote-button',
                votingAnimation === 'down' ? 'voteClick' : 'downvote',
                downvotingEnabled ? 'enabled' : 'disabled',
              ].join(' ')}
              tabIndex={ariaHidden ? -1 : 0}
            >
              <VoteIconContainer
                styleType={styleType}
                size={size}
                votingEnabled={downvotingEnabled}
              >
                <VoteIcon
                  name="downvote"
                  size={size}
                  enabled={downvotingEnabled}
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
