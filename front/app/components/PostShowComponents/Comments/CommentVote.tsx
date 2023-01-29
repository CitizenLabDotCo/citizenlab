import React, { PureComponent, MouseEvent } from 'react';
import { adopt } from 'react-adopt';
import { cloneDeep, isNumber, get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Icon } from '@citizenlab/cl2-component-library';

// services
import { addCommentVote, deleteCommentVote } from 'services/commentVotes';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetPost, { GetPostChildProps } from 'resources/GetPost';
import GetComment, { GetCommentChildProps } from 'resources/GetComment';
import GetCommentVote, {
  GetCommentVoteChildProps,
} from 'resources/GetCommentVote';
import GetInitiativesPermissions, {
  GetInitiativesPermissionsChildProps,
} from 'resources/GetInitiativesPermissions';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// events
import { openSignUpInModal } from 'events/openSignUpInModal';
import { openVerificationModal } from 'events/verificationModal';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors, fontSizes, isRtl } from 'utils/styleUtils';
import { lighten } from 'polished';

// a11y
import { ScreenReaderOnly } from 'utils/a11y';

const Container = styled.li`
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  margin-left: 1px;
  padding: 0;
`;

const UpvoteIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
`;

const UpvoteButton = styled.button`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  margin: 0;
  padding: 0;
  border: none;
  cursor: pointer;

  &.disabled {
    cursor: auto;
  }

  &.enabled:not(.voted):hover {
    color: #000;

    ${UpvoteIcon} {
      fill: #000;
    }
  }

  &.enabled.voted {
    color: ${colors.success};

    ${UpvoteIcon} {
      fill: ${colors.success};
    }
  }

  &.disabled:not(.voted) {
    color: ${lighten(0.25, colors.textSecondary)};

    ${UpvoteIcon} {
      fill: ${lighten(0.25, colors.textSecondary)};
    }
  }

  &.disabled.voted {
    color: ${lighten(0.25, colors.success)};

    ${UpvoteIcon} {
      fill: ${lighten(0.25, colors.success)};
    }
  }
`;

const UpvoteCount = styled.div`
  margin-left: 6px;
  ${isRtl`
    margin-right: 6px;
    margin-left: auto;
  `}
`;

interface InputProps {
  postId: string;
  postType: 'idea' | 'initiative';
  commentId: string;
  commentType: 'parent' | 'child' | undefined;
  className?: string;
}

interface DataProps {
  commentVotingPermissionInitiative: GetInitiativesPermissionsChildProps;
  authUser: GetAuthUserChildProps;
  post: GetPostChildProps;
  comment: GetCommentChildProps;
  commentVote: GetCommentVoteChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  voted: boolean;
  upvoteCount: number;
}

class CommentVote extends PureComponent<Props & WrappedComponentProps, State> {
  constructor(props: Props & WrappedComponentProps) {
    super(props);
    this.state = {
      voted: false,
      upvoteCount: 0,
    };
  }

  componentDidMount() {
    const { comment, commentVote } = this.props;

    this.setState({
      voted: !isNilOrError(commentVote),
      upvoteCount: !isNilOrError(comment)
        ? comment.attributes.upvotes_count
        : 0,
    });
  }

  componentDidUpdate(prevProps: Props, _prevState: State) {
    const { comment, commentVote } = this.props;
    const { voted } = this.state;
    const prevUpvoteCount = !isNilOrError(prevProps.comment)
      ? prevProps.comment?.attributes?.upvotes_count
      : 0;
    const upvoteCount = !isNilOrError(comment)
      ? comment?.attributes?.upvotes_count
      : 0;

    // Whenever the upvote count number returned by the GetComment resource component has changed
    // we update the value kept in the state to make sure we always use the correct and up-to-date upvote count coming back from the server
    if (upvoteCount !== prevUpvoteCount && isNumber(upvoteCount)) {
      this.setState({ upvoteCount });
    }

    if (
      voted === false &&
      isNilOrError(prevProps.commentVote) &&
      !isNilOrError(commentVote)
    ) {
      this.setState({ voted: true });
    }

    if (
      voted === true &&
      !isNilOrError(prevProps.commentVote) &&
      isNilOrError(commentVote)
    ) {
      this.setState({ voted: false });
    }
  }

  vote = async () => {
    const {
      postId,
      postType,
      commentId,
      commentType,
      authUser,
      comment,
      commentVote,
    } = this.props;
    const oldVotedValue = cloneDeep(this.state.voted);
    const oldUpvoteCount = cloneDeep(this.state.upvoteCount);
    if (!isNilOrError(authUser)) {
      if (!oldVotedValue) {
        try {
          this.setState((state) => ({
            voted: true,
            upvoteCount: state.upvoteCount + 1,
          }));

          await addCommentVote(postId, postType, commentId, {
            user_id: authUser.id,
            mode: 'up',
          });

          if (commentType === 'parent') {
            trackEventByName(tracks.clickParentCommentUpvoteButton);
          } else if (commentType === 'child') {
            trackEventByName(tracks.clickChildCommentUpvoteButton);
          } else {
            trackEventByName(tracks.clickCommentUpvoteButton);
          }
        } catch (error) {
          this.setState({ voted: oldVotedValue, upvoteCount: oldUpvoteCount });
        }
      }

      if (
        oldVotedValue &&
        !isNilOrError(comment) &&
        !isNilOrError(commentVote)
      ) {
        try {
          this.setState((state) => ({
            voted: false,
            upvoteCount: state.upvoteCount - 1,
          }));
          await deleteCommentVote(comment.id, commentVote.id);

          if (commentType === 'parent') {
            trackEventByName(tracks.clickParentCommentCancelUpvoteButton);
          } else if (commentType === 'child') {
            trackEventByName(tracks.clickChildCommentCancelUpvoteButton);
          } else {
            trackEventByName(tracks.clickCommentCancelUpvoteButton);
          }
        } catch (error) {
          this.setState({ voted: oldVotedValue, upvoteCount: oldUpvoteCount });
        }
      }
    }
  };

  handleVoteClick = async (event?: MouseEvent) => {
    event?.preventDefault();

    const { post, postType, authUser, commentVotingPermissionInitiative } =
      this.props;

    const commentingDisabledReason = get(
      post,
      'attributes.action_descriptor.commenting_idea.disabled_reason'
    );

    const authUserIsVerified =
      !isNilOrError(authUser) && authUser.attributes.verified;

    if (postType === 'idea') {
      if (!isNilOrError(authUser) && !commentingDisabledReason) {
        this.vote();
      } else if (
        !isNilOrError(authUser) &&
        !authUserIsVerified &&
        commentingDisabledReason === 'not_verified'
      ) {
        openVerificationModal();
      } else if (!authUser) {
        openSignUpInModal({
          verification: commentingDisabledReason === 'not_verified',
          action: () => this.handleVoteClick(),
        });
      }
    } else {
      if (commentVotingPermissionInitiative?.action === 'sign_in_up') {
        openSignUpInModal({
          action: () => this.handleVoteClick(),
        });
      } else if (
        commentVotingPermissionInitiative?.action === 'sign_in_up_and_verify'
      ) {
        openSignUpInModal({
          action: () => this.handleVoteClick(),
          verification: true,
          verificationContext: {
            action: 'commenting_initiative',
            type: 'initiative',
          },
        });
      } else if (commentVotingPermissionInitiative?.action === 'verify') {
        openVerificationModal({
          context: {
            action: 'commenting_initiative',
            type: 'initiative',
          },
        });
      } else if (commentVotingPermissionInitiative?.enabled === true) {
        this.vote();
      }
    }
  };

  render() {
    const {
      authUser,
      post,
      postType,
      className,
      comment,
      commentVotingPermissionInitiative,
      intl: { formatMessage },
    } = this.props;
    const { voted, upvoteCount } = this.state;

    if (!isNilOrError(comment)) {
      const commentingVotingDisabledReason = get(
        post,
        'attributes.action_descriptor.comment_voting_idea.disabled_reason'
      );
      const isSignedIn = !isNilOrError(authUser);
      const disabled =
        postType === 'initiative'
          ? !commentVotingPermissionInitiative?.enabled
          : isSignedIn && commentingVotingDisabledReason === 'not_permitted';

      if (!disabled || upvoteCount > 0) {
        return (
          <Container className={`vote ${className || ''}`}>
            <UpvoteButton
              onClick={this.handleVoteClick}
              disabled={disabled}
              className={`
                e2e-comment-vote
                ${voted ? 'voted' : 'notVoted'}
                ${disabled ? 'disabled' : 'enabled'}
              `}
            >
              <>
                <UpvoteIcon
                  name="vote-up"
                  className={`
                  ${voted ? 'voted' : 'notVoted'}
                  ${disabled ? 'disabled' : 'enabled'}
                `}
                />
                <ScreenReaderOnly>
                  {!voted
                    ? formatMessage(messages.upvoteComment)
                    : formatMessage(messages.a11y_undoUpvote)}
                </ScreenReaderOnly>
              </>
              {upvoteCount > 0 && (
                <UpvoteCount
                  className={`
                ${voted ? 'voted' : 'notVoted'}
                ${disabled ? 'disabled' : 'enabled'}
              `}
                >
                  {upvoteCount}
                </UpvoteCount>
              )}
            </UpvoteButton>
            <ScreenReaderOnly aria-live="polite">
              {formatMessage(messages.a11y_upvoteCount, {
                upvoteCount,
              })}
            </ScreenReaderOnly>
          </Container>
        );
      }
    }

    return null;
  }
}

const CommentVoteWithHOCs = injectIntl(CommentVote);

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  post: ({ postId, postType, render }) => (
    <GetPost id={postId} type={postType}>
      {render}
    </GetPost>
  ),
  comment: ({ commentId, render }) => (
    <GetComment id={commentId}>{render}</GetComment>
  ),
  commentVote: ({ comment, render }) => (
    <GetCommentVote
      voteId={
        !isNilOrError(comment)
          ? comment?.relationships?.user_vote?.data?.id
          : undefined
      }
    >
      {render}
    </GetCommentVote>
  ),
  commentVotingPermissionInitiative: (
    <GetInitiativesPermissions action="comment_voting_initiative" />
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <CommentVoteWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
