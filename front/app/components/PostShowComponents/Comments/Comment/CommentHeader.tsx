import React from 'react';
import Author from 'components/Author';
import { lighten } from 'polished';
import styled from 'styled-components';
import { media, colors, fontSizes, isRtl } from 'utils/styleUtils';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

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
  const { formatMessage } = useIntl();

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
      <Right>
        {moderator && (
          <AdminBadge>{formatMessage(messages.official)}</AdminBadge>
        )}
      </Right>
    </Container>
  );
};

export default CommentHeader;
