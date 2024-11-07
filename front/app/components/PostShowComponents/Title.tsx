import React, { memo } from 'react';

import { media, fontSizes, H1 } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import Outlet from 'components/Outlet';

const Container = styled.div<{ align: 'left' | 'center' }>`
  width: ${({ align }) => (align === 'left' ? '100%' : 'auto')};
`;

export const StyledH1 = styled(H1)<{
  customColor: string | undefined;
}>`
  color: ${({ customColor, theme }) => customColor || theme.colors.tenantText};

  ${media.tablet`
    font-size: ${fontSizes.xxl}px;
  `}
`;

interface Props {
  postId: string;
  title: string;
  translateButtonClicked?: boolean;
  className?: string;
  color?: string;
  align?: 'left' | 'center';
}

const PostTitle = memo<Props>(
  ({
    postId,
    title,
    translateButtonClicked,
    className,
    color,
    align = 'center',
  }) => {
    return (
      <Container className={className} align={align}>
        <Outlet
          id="app.components.PostShowComponents.Title.translation"
          title={title}
          postId={postId}
          color={color}
          translateButtonClicked={translateButtonClicked}
        >
          {(outletComponents) =>
            outletComponents.length > 0 ? (
              <>{outletComponents}</>
            ) : (
              <StyledH1 id="e2e-idea-title" customColor={color} m="0">
                {title}
              </StyledH1>
            )
          }
        </Outlet>
      </Container>
    );
  }
);

export default PostTitle;
