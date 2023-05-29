import React, { FormEvent } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// permissions
import { canModerateProject } from 'services/permissions/rules/projectPermissions';

// typings
import { ICommentData } from 'api/comments/types';
import { IOpenPostPageModalEvent } from 'containers/App';

// utils
import eventEmitter from 'utils/eventEmitter';

// style
import styled from 'styled-components';
import { colors, media, fontSizes, defaultCardStyle } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import { darken } from 'polished';

// Components
import { Icon } from '@citizenlab/cl2-component-library';
import Link from 'utils/cl-router/Link';
import CommentHeader from 'components/PostShowComponents/Comments/Comment/CommentHeader';
import CommentBody from 'components/PostShowComponents/Comments/Comment/CommentBody';

// intl
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useIdeaById from 'api/ideas/useIdeaById';
import useUserById from 'api/users/useUserById';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px 40px 40px;
  ${defaultCardStyle};

  &:not(:last-child) {
    margin-bottom: 20px;
  }

  ${media.phone`
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
  color: ${({ theme }) => theme.colors.tenantText};
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
  fill: ${colors.textSecondary};
  margin-right: 10px;
`;

const PostLinkRight = styled.div`
  color: ${colors.textSecondary};
  text-decoration: underline;
  white-space: nowrap;
`;

const VotesContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 20px;
`;

const VoteIcon = styled(Icon)`
  flex: 0 0 24px;
  fill: ${colors.textSecondary};
  margin-right: 5px;
  margin-top: -2px;
`;

const VoteCount = styled.div`
  color: ${colors.textSecondary};
`;

const CommentContainer = styled.div`
  padding-top: 30px;

  &:not(:last-child) {
    padding-bottom: 30px;
    border-bottom: 1px solid ${colors.divider};
  }
`;

interface Props {
  postId: string;
  postType: 'idea' | 'initiative';
  comments: ICommentData[];
  userId: string;
}

const nothingHappens = () => {};

const PostCommentGroup = ({ postType, comments, userId, postId }: Props) => {
  const initiativeId = postType === 'initiative' ? postId : undefined;
  const ideaId = postType === 'idea' ? postId : undefined;
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: idea } = useIdeaById(ideaId);
  const { data: user } = useUserById(userId);
  const post = initiative || idea;

  const onIdeaLinkClick = (event: FormEvent<any>) => {
    event.preventDefault();

    if (!isNilOrError(post)) {
      eventEmitter.emit<IOpenPostPageModalEvent>('cardClick', {
        id: post.data.id,
        slug: post.data.attributes.slug,
        type: postType,
      });
    }
  };

  if (isNilOrError(post) || isNilOrError(user)) {
    return null;
  }

  const { slug, title_multiloc } = post.data.attributes;
  const projectId: string | null =
    postType === 'idea' && 'project' in post.data.relationships
      ? post.data.relationships.project.data.id
      : null;

  return (
    <Container>
      <ScreenReaderOnly>
        {postType === 'idea' ? (
          <FormattedMessage {...messages.a11y_postCommentPostedIn} />
        ) : (
          <FormattedMessage {...messages.a11y_initiativePostedIn} />
        )}
      </ScreenReaderOnly>
      <PostLink to={`/${postType}s/${slug}`} onClick={onIdeaLinkClick}>
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
              moderator={canModerateProject(projectId, { data: user.data })}
            />
            <CommentBody
              commentId={comment.id}
              commentType="parent"
              editing={false}
              onCommentSaved={nothingHappens}
              onCancelEditing={nothingHappens}
              postId={postId}
              postType={postType}
            />
            <VotesContainer>
              <VoteIcon ariaHidden name="vote-up" />
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
};

export default PostCommentGroup;
