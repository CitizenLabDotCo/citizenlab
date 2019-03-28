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

const Container = styled.div``;

const UpvoteIconWrapper = styled.div`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: transparent;
  margin-top: -4px;

  &.voted {
    background: ${colors.clGreen};
  }
`;

const UpvoteCount = styled.div`
  color: ${colors.label};
  margin-left: 4px;
`;

const UpvoteIcon = styled(Icon)`
  width: 16px;
  height: 16px;
  fill: ${colors.label};

  &.voted {
    fill: #fff;
  }
`;

const UpvoteLabel = styled.div`
  color: ${colors.label};
  margin-left: 10px;
`;

const UpvoteButton = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  &:hover {
    ${UpvoteLabel} {
      text-decoration: underline;
    }

    &:not(.voted) {
      ${UpvoteIcon} {
        fill: #000;
      }

      ${UpvoteLabel} {
        color: #000;
      }
    }
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
          <UpvoteButton onClick={this.onVote} className={voted ? 'voted' : ''}>
            <UpvoteIconWrapper className={voted ? 'voted' : ''}>
              <UpvoteIcon name="upvote-2" className={voted ? 'voted' : ''} />
            </UpvoteIconWrapper>
            {upvoteCount > 0 &&
              <UpvoteCount>{upvoteCount}</UpvoteCount>
            }
            <UpvoteLabel>
              {!voted ? <FormattedMessage {...messages.commentUpvote} /> : <FormattedMessage {...messages.commentCancelUpvote} />}
            </UpvoteLabel>
          </UpvoteButton>
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
