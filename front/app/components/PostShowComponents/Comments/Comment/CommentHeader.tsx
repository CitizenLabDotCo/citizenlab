import React from 'react';
import Author from 'components/Author';
import { lighten } from 'polished';
import styled from 'styled-components';
import { media, colors, fontSizes, isRtl } from 'utils/styleUtils';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';
import { IPresentComment } from 'api/comments/types';
import useUserById from 'api/users/useUserById';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const Left = styled.div`
  display: flex;
  align-items: center;
`;

const Right = styled.div`
  display: flex;
  align-items: center;

  ${media.phone`
    display: none;
  `}
`;

const StyledAuthor = styled(Author)`
  margin-left: -4px;
`;

const AdminBadge = styled.span`
  color: ${colors.red600};
  font-size: ${fontSizes.xs}px;
  line-height: 16px;
  border-radius: ${(props) => props.theme.borderRadius};
  text-transform: uppercase;
  text-align: center;
  font-weight: 600;
  background: ${lighten(0.52, colors.red600)};
  border: none;
  padding: 4px 8px;
  height: 24px;
  display: flex;
  align-items: center;
`;

interface Props {
  className?: string;
  projectId?: string | null;
  commentType: 'parent' | 'child';
  commentAttributes: IPresentComment;
  authorId: string | null;
}

const CommentHeader = ({
  projectId,
  commentType,
  className,
  commentAttributes,
  authorId,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: author } = useUserById(authorId);

  const isModerator = author
    ? canModerateProject(projectId, { data: author.data })
    : false;

  // With the current implementation, this needs to always render,
  // even if author is null/undefined.
  // Otherwise we won't render CommentHeader in comments of deleted users.

  return (
    <Container className={className || ''}>
      <Left>
        <StyledAuthor
          authorId={authorId}
          authorHash={commentAttributes.author_hash}
          isLinkToProfile={typeof authorId === 'string'}
          size={30}
          projectId={projectId}
          showModeration={isModerator}
          createdAt={commentAttributes.created_at}
          avatarBadgeBgColor={commentType === 'child' ? '#fbfbfb' : '#fff'}
          horizontalLayout={true}
          color={colors.textSecondary}
          fontSize={fontSizes.base}
          fontWeight={400}
          underline={true}
          anonymous={commentAttributes.anonymous}
        />
      </Left>
      <Right>
        {isModerator && (
          <AdminBadge>{formatMessage(messages.official)}</AdminBadge>
        )}
      </Right>
    </Container>
  );
};

export default CommentHeader;
