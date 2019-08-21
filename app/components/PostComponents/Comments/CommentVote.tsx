import React, { PureComponent, MouseEvent } from 'react';
import { adopt } from 'react-adopt';
import { get, cloneDeep, isNumber } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

// components
import Icon from 'components/UI/Icon';

// services
import { addCommentVote, deleteCommentVote } from 'services/commentVotes';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetComment, { GetCommentChildProps } from 'resources/GetComment';
import GetCommentVote, { GetCommentVoteChildProps } from 'resources/GetCommentVote';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';
import { darken, lighten } from 'polished';

const UpvoteIconWrapper = styled.button`
  width: 18px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  margin: 0;
  padding: 0;
  margin-top: -3px;
  cursor: pointer;
  transition: background 100ms ease;
  border: none;

  &.disabled {
    cursor: auto;
  }

  &.notVoted {
    &.hasVotes {
      margin-right: 5px;
    }

    &.hasNoVotes {
      margin-right: 10px;
    }
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

  &.disabled {
    fill: ${lighten(0.25, colors.label)};
  }

  &.enabled.voted {
    fill: #fff;
  }
`;

const UpvoteCount = styled.div`
  color: ${colors.label};
  margin-right: 12px;

  &.disabled {
    color: ${lighten(0.25, colors.label)};
  }
`;

const UpvoteLabel = styled.button`
  color: ${colors.label};
  cursor: pointer;
  padding: 0;
  margin: 0;
  border: none;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const Container = styled.div`
  display: flex;
  align-items: center;

  &:hover {
    ${UpvoteIconWrapper} {

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
  votingEnabled: boolean;
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
    const prevUpvoteCount = get(prevProps.comment, 'attributes.upvotes_count');
    const upvoteCount = get(this.props.comment, 'attributes.upvotes_count');

    // Whenever the upvote count number returned by the GetComment resource component has changed
    // we update the value kept in the state to make sure we always use the correct and up-to-date upvote count coming back from the server
    if (upvoteCount !== prevUpvoteCount && isNumber(upvoteCount)) {
      this.setState({ upvoteCount });
    }

    if (this.state.voted === false && isNilOrError(prevProps.commentVote) && !isNilOrError(this.props.commentVote)) {
      this.setState({ voted: true });
    }

    if (this.state.voted === true && !isNilOrError(prevProps.commentVote) && isNilOrError(this.props.commentVote)) {
      this.setState({ voted: false });
    }
  }

  removeFocus = (event: React.MouseEvent) => {
    event.preventDefault();
  }

  onVote = async (event: MouseEvent) => {
    event.preventDefault();

    if (this.props.votingEnabled) {
      const oldVotedValue = cloneDeep(this.state.voted);
      const oldUpvoteCount = cloneDeep(this.state.upvoteCount);
      const { postId, postType, commentId, commentType, authUser, comment, commentVote } = this.props;

      if (!isNilOrError(authUser)) {
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
      } else {
        clHistory.push('/sign-in');
      }
    }
  }

  render() {
    const { votingEnabled, className, comment, intl } = this.props;
    const { voted, upvoteCount } = this.state;

    if (!isNilOrError(comment) && (votingEnabled || (!votingEnabled && upvoteCount > 0))) {
      return (
        <Container className={className}>
          <UpvoteIconWrapper
            aria-label={intl.formatMessage(messages.upvoteComment)}
            onMouseDown={this.removeFocus}
            onClick={this.onVote}
            className={`${voted ? 'voted' : 'notVoted'} ${upvoteCount > 0 ? 'hasVotes' : 'hasNoVotes'} ${votingEnabled ? 'enabled' : 'disabled'}`}
          >
            <UpvoteIcon name="upvote" className={`${voted ? 'voted' : ''} ${votingEnabled ? 'enabled' : 'disabled'}`} />
          </UpvoteIconWrapper>

          {upvoteCount > 0 &&
            <UpvoteCount className={`${upvoteCount > 0 ? 'visible' : 'hidden'} ${votingEnabled ? 'enabled' : 'disabled'}`}>{upvoteCount}</UpvoteCount>
          }

          {votingEnabled &&
            <UpvoteLabel onMouseDown={this.removeFocus} onClick={this.onVote}>
              {!voted ? <FormattedMessage {...messages.commentUpvote} /> : <FormattedMessage {...messages.commentCancelUpvote} />}
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
  commentVote: ({ comment, render }) => <GetCommentVote voteId={get(comment, 'relationships.user_vote.data.id')}>{render}</GetCommentVote>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <CommentVoteWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
