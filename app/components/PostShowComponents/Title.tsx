import React, { memo } from 'react';

// typings
import { Locale } from 'typings';

// styling
import styled from 'styled-components';
import { media, fontSizes } from 'utils/styleUtils';
import Outlet from 'components/Outlet';

const Container = styled.div<{ align: 'left' | 'center' }>`
  width: ${({ align }) => (align === 'left' ? '100%' : 'auto')};
`;

export const Title = styled.h1<{
  color: string | undefined;
  align: 'left' | 'center';
}>`
  width: 100%;
  color: ${({ color, theme }) => color || theme.colorText};
  font-size: ${fontSizes.xxxl}px;
  font-weight: 500;
  line-height: normal;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin: 0;
  padding: 0;
  z-index: 1;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.xxl}px;
  `}
`;

interface Props {
  postId: string;
  postType: 'idea' | 'initiative';
  title: string;
  locale?: Locale;
  translateButtonClicked?: boolean;
  className?: string;
  color?: string;
  align?: 'left' | 'center';
}

const PostTitle = memo<Props>(
  ({
    postId,
    postType,
    title,
    locale,
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
          postType={postType}
          color={color}
          align={align}
          translateButtonClicked={translateButtonClicked}
          locale={locale}
        >
          {(outletComponents) =>
            outletComponents.length > 0 ? (
              <>{outletComponents}</>
            ) : (
              <Title id={`e2e-${postType}-title`} color={color} align={align}>
                {title}
              </Title>
            )
          }
        </Outlet>
      </Container>
    );
  }
);

export default PostTitle;
