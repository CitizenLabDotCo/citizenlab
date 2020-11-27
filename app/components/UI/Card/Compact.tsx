import React, { memo, MouseEvent } from 'react';
import bowser from 'bowser';

// components
import Link from 'utils/cl-router/Link';
import LazyImage from 'components/LazyImage';

// styling
import styled from 'styled-components';
import {
  defaultCardStyle,
  defaultCardHoverStyle,
  media,
  colors,
  fontSizes,
} from 'utils/styleUtils';

const Container = styled(Link)`
  width: 100%;
  height: 204px;
  display: flex;
  align-items: center;
  padding: 20px;
  margin: 0;
  margin-bottom: 24px;
  cursor: pointer;
  ${defaultCardStyle};

  &.desktop {
    ${defaultCardHoverStyle};
    transform: translate(0px, -2px);
  }

  ${media.smallerThanMinTablet`
    height: auto;
    flex-direction: column;
    align-items: stretch;
  `}
`;

const ImageWrapper = styled.div<{ hasImage: boolean }>`
  flex: 0 0 162px;
  width: 162px;
  height: 162px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 23px;
  overflow: hidden;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: solid 1px
    ${({ hasImage }) => (hasImage ? colors.separation : 'transparent')};

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const Image = styled(LazyImage)`
  flex: 0 0 162px;
  width: 162px;
  height: 162px;
  object-fit: cover;

  ${media.smallerThanMinTablet`
    width: 100%;
  `}
`;

const ContentWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 162px;
`;

const Header = styled.header`
  padding: 0;
  margin: 0;
  margin-bottom: 10px;

  ${media.smallerThanMaxTablet`
    margin-bottom: 12px;
  `}
`;

const Title = styled.h3`
  color: ${(props) => props.theme.colorText};
  font-size: 20px;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-height: 25px;
  max-height: 75px;
  padding: 0;
  margin: 0;
  overflow: hidden;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.large};
    line-height: 23px;
    max-height: 96px;
  `}
`;

const Body = styled.div`
  flex-grow: 1;
`;

interface Props {
  to: string;
  image: string | null;
  imagePlaceholder: JSX.Element;
  author?: {
    name: string;
    id: string;
  } | null;
  title: JSX.Element | string;
  body: JSX.Element | string;
  footer: JSX.Element | string;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  className?: string;
}

export const Card = ({
  to,
  onClick,
  image,
  imagePlaceholder,
  title,
  body,
  footer,
  className,
}: Props) => (
  <Container
    onClick={onClick}
    to={to}
    className={`e2e-card ${className} ${
      !(bowser.mobile || bowser.tablet) ? 'desktop' : 'mobile'
    }`}
  >
    <ImageWrapper hasImage={!!image}>
      {image ? <Image src={image} alt="" /> : imagePlaceholder}
    </ImageWrapper>

    <ContentWrapper>
      <Header className="e2e-card-title">
        {typeof title === 'string' ? (
          <Title title={title}>{title}</Title>
        ) : (
          title
        )}
      </Header>

      <Body>{body}</Body>

      {footer}
    </ContentWrapper>
  </Container>
);

export default memo<Props>(Card);
