import React from 'react';

import {
  colors,
  media,
  fontSizes,
  defaultCardStyle,
  Icon,
} from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import styled from 'styled-components';

import { ICommentData } from 'api/comments/types';
import useIdeaById from 'api/ideas/useIdeaById';
import useProjectById from 'api/projects/useProjectById';
import useUserById from 'api/users/useUserById';

import CommentBody from 'components/PostShowComponents/Comments/Comment/CommentBody';
import CommentHeader from 'components/PostShowComponents/Comments/Comment/CommentHeader';
import T from 'components/T';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import messages from './messages';

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

const ReactionsContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 20px;
`;

const ReactionIcon = styled(Icon)`
  flex: 0 0 24px;
  fill: ${colors.textSecondary};
  margin-right: 5px;
  margin-top: -2px;
`;

const ReactionCount = styled.div`
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
  comments: ICommentData[];
  userId: string;
}

const nothingHappens = () => {};

const PostCommentGroup = ({ comments, userId, postId }: Props) => {
  const { data: idea } = useIdeaById(postId);
  const { data: project } = useProjectById(
    idea?.data.relationships.project.data.id
  );
  const { data: user } = useUserById(userId);

  if (!idea || isNilOrError(user)) {
    return null;
  }

  const { slug, title_multiloc } = idea.data.attributes;
  const userCanModerate = project
    ? canModerateProject(project.data, user)
    : false;

  return (
    <Container>
      <ScreenReaderOnly>
        <FormattedMessage {...messages.a11y_postCommentPostedIn} />
      </ScreenReaderOnly>
      <PostLink to={`/ideas/${slug}?go_back=true`}>
        <PostLinkLeft>
          <StyledIcon ariaHidden name={'idea'} />
          <T value={title_multiloc} className="text" />
        </PostLinkLeft>
        <PostLinkRight>
          <FormattedMessage {...messages.seePost} />
        </PostLinkRight>
      </PostLink>

      {comments.map((comment) => {
        // Don't show deleted comments. Better to have a filter in the BE.
        if (comment.attributes.publication_status === 'published') {
          return (
            <CommentContainer key={comment.id}>
              <CommentHeader
                authorId={userId}
                commentType="parent"
                commentAttributes={comment.attributes}
                userCanModerate={userCanModerate}
              />
              <CommentBody
                commentId={comment.id}
                commentType="parent"
                editing={false}
                onCommentSaved={nothingHappens}
                onCancelEditing={nothingHappens}
                ideaId={idea.data.id}
              />
              <ReactionsContainer>
                <ReactionIcon ariaHidden name="vote-up" />
                <ReactionCount aria-hidden>
                  {comment.attributes.likes_count}
                </ReactionCount>
                <ScreenReaderOnly>
                  <FormattedMessage
                    {...messages.a11y_likesCount}
                    values={{
                      likesCount: comment.attributes.likes_count,
                    }}
                  />
                </ScreenReaderOnly>
              </ReactionsContainer>
            </CommentContainer>
          );
        }

        return null;
      })}
    </Container>
  );
};

export default PostCommentGroup;
