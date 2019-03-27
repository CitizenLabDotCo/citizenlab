import React, { PureComponent, MouseEvent } from 'react';
import { adopt } from 'react-adopt';
import { get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// components
import Icon from 'components/UI/Icon';

// services
import { addCommentVote } from 'services/commentVotes';

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

const Container = styled.div`
  border: solid 1px red;
`;

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

const UpvoteIcon = styled(Icon)`
  width: 17px;
  height: 17px;
  fill: ${colors.label};

  &.voted {
    fill: #fff;
  }
`;

const UpvoteLabel = styled.div`
  color: ${colors.label};
  margin-left: 8px;
`;

const UpvoteButton = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  &:hover {
    ${UpvoteIcon} {
      fill: #000;
    }

    ${UpvoteLabel} {
      color: #000;
      text-decoration: underline;
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
}

class CommentVote extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      voted: false
    };
  }

  onUpvote = async (event: MouseEvent) => {
    event.preventDefault();

    const { commentId, authUser } = this.props;

    if (!isNilOrError(authUser)) {
      try {
        await addCommentVote(commentId, {
          user_id: authUser.id,
          mode: 'up'
        });
        console.log('voted');
      } catch (error) {
        console.log(error);
        // empty
      }
    }
  }

  render() {
    const { className, comment, commentVote } = this.props;
    const { voted } = this.state;

    console.log('comment:');
    console.log(comment);
    console.log('commentVote:');
    console.log(commentVote);

    if (!isNilOrError(comment)) {
      return (
        <Container className={className}>
          <UpvoteButton onClick={this.onUpvote}>
            <UpvoteIconWrapper className={voted ? 'voted' : ''}>
              <UpvoteIcon name="upvote-2" className={voted ? 'voted' : ''} />
            </UpvoteIconWrapper>
            <UpvoteLabel>
              <FormattedMessage {...messages.commentUpvote} />
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
