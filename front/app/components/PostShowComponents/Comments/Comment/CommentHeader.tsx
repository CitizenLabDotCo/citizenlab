import React from 'react';

// components
import Author from 'components/Author';
import AdminBadge from './AdminBadge';

// style
import styled from 'styled-components';
import { media, colors, fontSizes, isRtl } from 'utils/styleUtils';

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

interface Props {
  className?: string;
  projectId?: string | null;
  authorId: string | null;
  authorHash?: string;
  commentId: string;
  commentType: 'parent' | 'child';
  commentCreatedAt: string;
  moderator: boolean;
  anonymous?: boolean;
}

const CommentHeader = ({
  projectId,
  authorId,
  authorHash,
  commentType,
  commentCreatedAt,
  moderator,
  className,
  anonymous,
}: Props) => {
  const hasAuthorId = !!authorId;

  return (
    <Container className={className || ''}>
      <Left>
        <StyledAuthor
          authorId={authorId}
          authorHash={authorHash}
          isLinkToProfile={hasAuthorId}
          size={30}
          projectId={projectId}
          showModeration={moderator}
          createdAt={commentCreatedAt}
          avatarBadgeBgColor={commentType === 'child' ? '#fbfbfb' : '#fff'}
          horizontalLayout={true}
          color={colors.textSecondary}
          fontSize={fontSizes.base}
          fontWeight={400}
          underline={true}
          anonymous={anonymous}
        />
      </Left>
      <Right>{moderator && <AdminBadge />}</Right>
    </Container>
  );
};

export default CommentHeader;
