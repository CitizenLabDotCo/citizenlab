import React, { memo } from 'react';

// typings

// styling
import styled from 'styled-components';
import { media, fontSizes } from 'utils/styleUtils';

const Container = styled.div<{ align: 'left' | 'center' }>`
  width: ${({ align }) => (align === 'left' ? '100%' : 'auto')};
`;

export const Title = styled.h1<{
  color: string | undefined;
  align: 'left' | 'center';
}>`
  width: 100%;
  color: ${({ color, theme }) => color || theme.colors.tenantText};
  font-size: ${fontSizes.xxxl}px;
  font-weight: 500;
  line-height: normal;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin: 0;
  padding: 0;
  z-index: 1;

  ${media.tablet`
    font-size: ${fontSizes.xxl}px;
  `}
`;

interface Props {
  postId: string;
  postType: 'idea' | 'initiative';
  title: string;

  className?: string;
  color?: string;
  align?: 'left' | 'center';
}

const PostTitle = memo<Props>(
  ({ title, postType, className, color, align = 'center' }) => {
    return (
      <Container className={className} align={align}>
        <Title id={`e2e-${postType}-title`} color={color} align={align}>
          {title}
        </Title>
      </Container>
    );
  }
);

export default PostTitle;
