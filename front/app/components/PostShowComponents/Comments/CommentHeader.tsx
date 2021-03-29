import React, { PureComponent } from 'react';

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

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const StyledAuthor = styled(Author)`
  margin-left: -4px;
`;

interface InputProps {
  className?: string;
  projectId?: string | null;
  authorId: string | null;
  commentId: string;
  commentType: 'parent' | 'child';
  commentCreatedAt: string;
  moderator: boolean;
}

interface Props extends InputProps {}

interface State {}

export default class CommentHeader extends PureComponent<Props, State> {
  render() {
    const {
      projectId,
      authorId,
      commentType,
      commentCreatedAt,
      moderator,
      className,
    } = this.props;
    const hasAuthorId = !!authorId;

    return (
      <Container className={className || ''}>
        <Left>
          <StyledAuthor
            authorId={authorId}
            isLinkToProfile={hasAuthorId}
            size={30}
            projectId={projectId}
            showModeration={moderator}
            createdAt={commentCreatedAt}
            avatarBadgeBgColor={commentType === 'child' ? '#fbfbfb' : '#fff'}
            horizontalLayout={true}
            color={colors.label}
            fontSize={fontSizes.base}
            fontWeight={400}
            underline={true}
          />
        </Left>
        <Right>{moderator && <AdminBadge />}</Right>
      </Container>
    );
  }
}
