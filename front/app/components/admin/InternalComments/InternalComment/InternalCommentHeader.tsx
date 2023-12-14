import React from 'react';
import Author from 'components/Author';
import { lighten } from 'polished';
import styled from 'styled-components';
import {
  media,
  colors,
  fontSizes,
  isRtl,
} from '@citizenlab/cl2-component-library';
import { useIntl } from 'utils/cl-intl';
import commentsMessages from 'components/PostShowComponents/Comments/messages';
import { IPresentInternalComment } from 'api/internal_comments/types';

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
  commentAttributes: IPresentInternalComment;
  authorId: string | null;
}

const InternalCommentHeader = ({
  projectId,
  commentType,
  className,
  commentAttributes,
  authorId,
}: Props) => {
  const { formatMessage } = useIntl();

  // With the current implementation, this needs to always render,
  // even if author is null/undefined.
  // Otherwise we won't render CommentHeader in comments of deleted users.

  return (
    <Container className={className || ''}>
      <Left>
        <StyledAuthor
          authorId={authorId}
          isLinkToProfile={typeof authorId === 'string'}
          size={30}
          projectId={projectId}
          showModeration
          createdAt={commentAttributes.created_at}
          avatarBadgeBgColor={commentType === 'child' ? '#fbfbfb' : '#fff'}
          horizontalLayout={true}
          color={colors.textSecondary}
          fontSize={fontSizes.base}
          fontWeight={400}
          underline={true}
        />
      </Left>
      <Right>
        <AdminBadge>{formatMessage(commentsMessages.official)}</AdminBadge>
      </Right>
    </Container>
  );
};

export default InternalCommentHeader;
