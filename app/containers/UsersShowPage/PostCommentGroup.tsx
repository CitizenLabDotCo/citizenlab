import React, { PureComponent, FormEvent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import { get } from 'lodash-es';

// resources & typings
import GetPost, { GetPostChildProps } from 'resources/GetPost';
import GetUser, { GetUserChildProps } from 'resources/GetUser';

// permissions
import { canModerateProject } from 'services/permissions/rules/projectPermissions';

// typings
import { ICommentData } from 'services/comments';
import { IOpenPostPageModalEvent } from 'containers/App';

// utils
import eventEmitter from 'utils/eventEmitter';

// style
import styled from 'styled-components';
import { colors, media, fontSizes, defaultCardStyle } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import { darken } from 'polished';

// Components
import { Icon } from 'cl2-component-library';
import Link from 'utils/cl-router/Link';
import CommentHeader from 'components/PostShowComponents/Comments/CommentHeader';
import CommentBody from 'components/PostShowComponents/Comments/CommentBody';

// intl
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px 40px 40px;
  ${defaultCardStyle};

  &:not(:last-child) {
    margin-bottom: 20px;
  }

  ${media.smallerThanMinTablet`
    padding: 17px 30px 30px;
  `}
`;

const PostLink = styled(Link)`
  background: ${colors.background};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.borderRadius};

  &:hover,
  &:focus {
    background: ${darken(0.02, colors.background)};
  }
`;

const PostLinkLeft = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  color: ${({ theme }) => theme.colorText};
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-right: 10px;
  min-width: 0px;

  .text {
    font-size: ${fontSizes.base}px;
    font-weight: 500;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const StyledIcon = styled(Icon)`
  fill: ${colors.label};
  width: 20px;
  height: 20px;
  margin-right: 10px;
`;

const PostLinkRight = styled.div`
  color: ${colors.label};
  text-decoration: underline;
  white-space: nowrap;
`;

const VotesContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 20px;
`;

const VoteIcon = styled(Icon)`
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  fill: ${colors.label};
  margin-right: 5px;
  margin-top: -2px;
`;

const VoteCount = styled.div`
  color: ${colors.label};
`;

const CommentContainer = styled.div`
  padding-top: 30px;

  &:not(:last-child) {
    padding-bottom: 30px;
    border-bottom: 1px solid ${colors.separation};
  }
`;

interface InputProps {
  postId: string;
  postType: 'idea' | 'initiative';
  comments: ICommentData[];
  userId: string;
}

interface DataProps {
  post: GetPostChildProps;
  user: GetUserChildProps;
}

const nothingHappens = () => {};

interface Props extends InputProps, DataProps {}

export class PostCommentGroup extends PureComponent<Props> {
  onIdeaLinkClick = (event: FormEvent<any>) => {
    event.preventDefault();

    const { post, postType } = this.props;

    if (!isNilOrError(post)) {
      eventEmitter.emit<IOpenPostPageModalEvent>('cardClick', {
        id: post.id,
        slug: post.attributes.slug,
        type: postType,
      });
    }
  };

  render() {
    const { postType, post, comments, userId, user } = this.props;

    if (!isNilOrError(post) && !isNilOrError(user)) {
      const { slug, title_multiloc } = post.attributes;
      const projectId: string | null = get(
        post,
        'relationships.project.data.id',
        null
      );

      return (
        <Container>
          <ScreenReaderOnly>
            {postType === 'idea' ? (
              <FormattedMessage {...messages.a11y_postCommentPostedIn} />
            ) : (
              <FormattedMessage {...messages.a11y_initiativePostedIn} />
            )}
          </ScreenReaderOnly>
          <PostLink to={`/${postType}s/${slug}`} onClick={this.onIdeaLinkClick}>
            <PostLinkLeft>
              <StyledIcon
                ariaHidden
                name={postType === 'idea' ? 'idea' : 'initiatives'}
              />
              <T value={title_multiloc} className="text" />
            </PostLinkLeft>
            <PostLinkRight>
              {postType === 'idea' ? (
                <FormattedMessage {...messages.seePost} />
              ) : (
                <FormattedMessage {...messages.seeInitiative} />
              )}
            </PostLinkRight>
          </PostLink>

          {comments.map((comment) => {
            return (
              <CommentContainer key={comment.id}>
                <CommentHeader
                  projectId={projectId}
                  authorId={userId}
                  commentId={comment.id}
                  commentType="parent"
                  commentCreatedAt={comment.attributes.created_at}
                  moderator={canModerateProject(projectId, { data: user })}
                />
                <CommentBody
                  commentId={comment.id}
                  commentType="parent"
                  editing={false}
                  onCommentSaved={nothingHappens}
                  onCancelEditing={nothingHappens}
                />
                <VotesContainer>
                  <VoteIcon ariaHidden name="upvote" />
                  <VoteCount aria-hidden>
                    {comment.attributes.upvotes_count}
                  </VoteCount>
                  <ScreenReaderOnly>
                    <FormattedMessage
                      {...messages.a11y_upvotesCount}
                      values={{
                        upvotesCount: comment.attributes.upvotes_count,
                      }}
                    />
                  </ScreenReaderOnly>
                </VotesContainer>
              </CommentContainer>
            );
          })}
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  post: ({ postId, postType, render }) => (
    <GetPost id={postId} type={postType}>
      {render}
    </GetPost>
  ),
  user: ({ userId, render }) => <GetUser id={userId}>{render}</GetUser>,
});

const WrappedPostComments = (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <PostCommentGroup {...inputProps} {...dataProps} />}
  </Data>
);

export default WrappedPostComments;
