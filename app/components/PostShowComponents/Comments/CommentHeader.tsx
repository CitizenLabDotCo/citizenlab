import React, { PureComponent } from 'react';

// components
import Author from 'components/Author';
import AdminBadge from './AdminBadge';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 13px;
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
    } = this.props;
    const hasAuthorId = !!authorId;

    return (
      <Container>
        <Left>
          <StyledAuthor
            authorId={authorId}
            isLinkToProfile={hasAuthorId}
            size="32px"
            projectId={projectId}
            showModeration={moderator}
            createdAt={commentCreatedAt}
            avatarBadgeBgColor={commentType === 'child' ? '#fbfbfb' : '#fff'}
          />
        </Left>

        <Right>{moderator && <AdminBadge />}</Right>
      </Container>
    );
  }
}
