import React, { PureComponent, MouseEvent } from 'react';
import { adopt } from 'react-adopt';
import { cloneDeep, isNumber } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { LiveMessage } from 'react-aria-live';

// components
import { Icon } from 'cl2-component-library';

// services
import { addCommentVote, deleteCommentVote } from 'services/commentVotes';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetComment, { GetCommentChildProps } from 'resources/GetComment';
import GetCommentVote, { GetCommentVoteChildProps } from 'resources/GetCommentVote';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// events
import { openSignUpInModal } from 'components/SignUpIn/events';
import { openVerificationModal } from 'components/Verification/verificationModalEvents';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';
import { darken, lighten } from 'polished';

// a11y
import { ScreenReaderOnly } from 'utils/a11y';

const UpvoteButton = styled.button`
  width: 18px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  margin: 0;
  padding: 0;
  border: none;
  cursor: pointer;
  transition: background 100ms ease;

  &.disabled {
    cursor: auto;
  }

  &.notVoted {
    margin-right: 5px;
  }

  &.voted {
    margin-right: 3px;

    &.enabled {
      width: 28px;
      border-radius: 50%;
      background: ${colors.clGreen};
    }
  }
`;

const UpvoteIcon = styled(Icon)`
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  fill: ${colors.label};
  margin-top: -2px;

  &.disabled {
    fill: ${lighten(0.25, colors.label)};
  }

  &.enabled.voted {
    fill: #fff;
  }
`;

const UpvoteCount = styled.div`
  color: ${colors.label};

  &.disabled {
    color: ${lighten(0.25, colors.label)};
  }
`;

const UpvoteLabel = styled.button`
  color: ${colors.label};
  cursor: pointer;
  padding: 0;
  margin: 0;
  margin-left: 12px;
  border: none;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const UpvoteButtonWrapper = styled.div`
  margin-top: -2px;
`;

const Container = styled.div`
  display: flex;
  align-items: center;

  &:hover {
    ${UpvoteButton} {
      &.enabled {
        &.notVoted {
          ${UpvoteIcon} {
            fill: #000;
          }
        }

        &.voted {
          background: ${darken(0.1, colors.clGreen)};
        }
      }
    }

    ${UpvoteLabel} {
      color: #000;
      text-decoration: underline;
    }
  }

  ${media.smallerThanMinTablet`
    margin-right: 5px;
  `}
`;

interface InputProps {
  postId: string;
  postType: 'idea' | 'initiative';
  commentId: string;
  commentType: 'parent' | 'child' | undefined;
  disabled?: boolean;
  commentingDisabledReason?: any;
  className?: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  comment: GetCommentChildProps;
  commentVote: GetCommentVoteChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  voted: boolean;
  upvoteCount: number;
}

class CommentVote extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      voted: false,
      upvoteCount: 0
    };
  }

  componentDidMount() {
    const { comment, commentVote } = this.props;

    this.setState({
      voted: !isNilOrError(commentVote),
      upvoteCount: !isNilOrError(comment) ? comment.attributes.upvotes_count : 0
    });
  }

  componentDidUpdate(prevProps: Props, _prevState: State) {
    const { comment, commentVote } = this.props;
    const { voted } = this.state;
    const prevUpvoteCount = !isNilOrError(prevProps.comment) ? prevProps.comment?.attributes?.upvotes_count : 0;
    const upvoteCount = !isNilOrError(comment) ? comment?.attributes?.upvotes_count : 0;

    // Whenever the upvote count number returned by the GetComment resource component has changed
    // we update the value kept in the state to make sure we always use the correct and up-to-date upvote count coming back from the server
    if (upvoteCount !== prevUpvoteCount && isNumber(upvoteCount)) {
      this.setState({ upvoteCount });
    }

    if (voted === false && isNilOrError(prevProps.commentVote) && !isNilOrError(commentVote)) {
      this.setState({ voted: true });
    }

    if (voted === true && !isNilOrError(prevProps.commentVote) && isNilOrError(commentVote)) {
      this.setState({ voted: false });
    }
  }

  onVote = async (event?: MouseEvent) => {
    event?.preventDefault();

    const { postId, postType, commentId, commentType, commentingDisabledReason, authUser, comment, commentVote } = this.props;
    const oldVotedValue = cloneDeep(this.state.voted);
    const oldUpvoteCount = cloneDeep(this.state.upvoteCount);
    const authUserIsVerified = !isNilOrError(authUser) && authUser.attributes.verified;

    if (!isNilOrError(authUser) && !commentingDisabledReason) {
      if (!oldVotedValue) {
        try {
          this.setState(state => ({ voted: true, upvoteCount: state.upvoteCount + 1 }));

          await addCommentVote(postId, postType, commentId, {
            user_id: authUser.id,
            mode: 'up'
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

      if (oldVotedValue && !isNilOrError(comment) && !isNilOrError(commentVote)) {
        try {
          this.setState(state => ({ voted: false, upvoteCount: state.upvoteCount - 1 }));
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
    } else if (!isNilOrError(authUser) && !authUserIsVerified && commentingDisabledReason === 'not_verified') {
      openVerificationModal();
    } else if (!authUser) {
      openSignUpInModal({
        verification: commentingDisabledReason === 'not_verified',
        action: () => this.onVote()
      });
    }
  }

  render() {
    const { className, comment, disabled, intl: { formatMessage } } = this.props;
    const { voted, upvoteCount } = this.state;

    if (!isNilOrError(comment)) {
      return (
        <Container className={className}>
          <UpvoteButtonWrapper>
            <UpvoteButton
              onClick={this.onVote}
              disabled={disabled}
              className={`
                e2e-comment-vote
                ${voted ? 'voted' : 'notVoted'}
                ${disabled ? 'disabled' : 'enabled'}
              `}
            >
              <UpvoteIcon
                name="upvote"
                className={`
                  ${voted ? 'voted' : 'notVoted'}
                  ${disabled ? 'disabled' : 'enabled'}
                `}
                title={!voted ?
                  formatMessage(messages.upvoteComment)
                  :
                  formatMessage(messages.a11y_undoUpvote)
                }
              />
            </UpvoteButton>
          </UpvoteButtonWrapper>

          <LiveMessage message={formatMessage(messages.a11y_upvoteCount, { upvoteCount })} aria-live="polite" />

          <UpvoteCount className={disabled ? 'disabled' : 'enabled'}>
            {upvoteCount}
          </UpvoteCount>

          {!disabled &&
            <UpvoteLabel onClick={this.onVote}>
              {/* To be displayed, not picked up by screen readers */}
              <span aria-hidden>
                {!voted
                  ? <FormattedMessage {...messages.commentUpvote} />
                  : <FormattedMessage {...messages.commentCancelUpvote} />
                }
              </span>
              {/* For screen readers */}
              <ScreenReaderOnly>
                {!voted ?
                  formatMessage(messages.upvoteComment) : formatMessage(messages.a11y_undoUpvote)
                }
              </ScreenReaderOnly>
            </UpvoteLabel>
          }
        </Container>
      );
    }

    return null;
  }
}

const CommentVoteWithHOCs = injectIntl(CommentVote);

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  comment: ({ commentId, render }) => <GetComment id={commentId}>{render}</GetComment>,
  commentVote: ({ comment, render }) => <GetCommentVote voteId={!isNilOrError(comment) ? comment?.relationships?.user_vote?.data?.id : undefined}>{render}</GetCommentVote>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <CommentVoteWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
