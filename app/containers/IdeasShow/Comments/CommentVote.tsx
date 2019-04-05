import React, { PureComponent, MouseEvent } from 'react';
import { adopt } from 'react-adopt';
import { get, cloneDeep, isNumber } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// components
import Icon from 'components/UI/Icon';

// services
import { addCommentVote, deleteCommentVote } from 'services/commentVotes';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetComment, { GetCommentChildProps } from 'resources/GetComment';
import GetCommentVote, { GetCommentVoteChildProps } from 'resources/GetCommentVote';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { darken } from 'polished';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const UpvoteIcon = styled(Icon)`
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  fill: ${colors.label};
  margin-top: -1px;

  &.voted {
    fill: #fff;
  }
`;

const UpvoteIconWrapper = styled.button`
  width: 29px;
  height: 29px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: transparent;
  margin-top: -4px;
  cursor: pointer;
  transition: all 100ms ease;

  &.voted {
    background: ${colors.clGreen};

    &:hover {
      background: ${darken(0.1, colors.clGreen)};
    }
  }

  &:not(.voted) {
    &:hover {
      ${UpvoteIcon} {
        fill: #000;
      }
    }
  }
`;

const UpvoteCount = styled.div`
  color: ${colors.label};
  margin-left: 4px;
`;

const UpvoteLabel = styled.button`
  color: ${colors.label};
  margin-left: 4px;
  cursor: pointer;

  &:hover {
    color: #000;
    text-decoration: underline;
  }
`;

interface InputProps {
  commentId: string;
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

class CommentVote extends PureComponent<Props, State> {
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

    // whener the upvote count number returned by the GetComment resource component has changed
    // we update the value kept in the state to make sure we always use the 'correct' upvote count
    // whenever it's being returned from the back-end
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

    const oldVotedValue = cloneDeep(this.state.voted);
    const oldUpvoteCount = cloneDeep(this.state.upvoteCount);
    const { commentId, authUser, comment, commentVote } = this.props;

    if (!isNilOrError(authUser)) {
      if (!oldVotedValue) {
        try {
          this.setState(state => ({ voted: true, upvoteCount: state.upvoteCount + 1 }));
          await addCommentVote(commentId, {
            user_id: authUser.id,
            mode: 'up'
          });
        } catch (error) {
          this.setState({ voted: oldVotedValue, upvoteCount: oldUpvoteCount });
        }
      }

      if (oldVotedValue && !isNilOrError(comment) && !isNilOrError(commentVote)) {
        try {
          this.setState(state => ({ voted: false, upvoteCount: state.upvoteCount - 1 }));
          await deleteCommentVote(comment.id, commentVote.id);
        } catch (error) {
          this.setState({ voted: oldVotedValue, upvoteCount: oldUpvoteCount });
        }
      }
    }
  }

  render() {
    const { className, comment } = this.props;
    const { voted, upvoteCount } = this.state;

    if (!isNilOrError(comment)) {
      return (
        <Container className={className}>
          <UpvoteIconWrapper onMouseDown={this.removeFocus} onClick={this.onVote} className={voted ? 'voted' : ''}>
            <UpvoteIcon name="upvote-2" className={voted ? 'voted' : ''} />
          </UpvoteIconWrapper>

          {upvoteCount > 0 &&
            <UpvoteCount>{upvoteCount}</UpvoteCount>
          }

          <UpvoteLabel onMouseDown={this.removeFocus} onClick={this.onVote}>
            {!voted ? <FormattedMessage {...messages.commentUpvote} /> : <FormattedMessage {...messages.commentCancelUpvote} />}
          </UpvoteLabel>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  comment: ({ commentId, render }) => <GetComment id={commentId}>{render}</GetComment>,
  commentVote: ({ comment, render }) => <GetCommentVote voteId={get(comment, 'relationships.user_vote.data.id')}>{render}</GetCommentVote>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <CommentVote {...inputProps} {...dataProps} />}
  </Data>
);
