import React, { memo, MouseEvent } from 'react';
import bowser from 'bowser';

// components
import Link from 'utils/cl-router/Link';
import LazyImage from 'components/LazyImage';

// styling
import styled from 'styled-components';
import {
  fontSizes,
  defaultCardStyle,
  defaultCardHoverStyle,
} from 'utils/styleUtils';

const Container = styled(Link)`
  width: 100%;
  height: 212px;
  margin-bottom: 24px;
  cursor: pointer;
  display: flex;
  padding: 24px;
  align-items: center;
  ${defaultCardStyle};

  &.desktop {
    ${defaultCardHoverStyle};
  }
`;

const ImageWrapper = styled.div`
  width: 162px;
  height: 162px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-top-left-radius: ${(props: any) => props.theme.borderRadius};
  border-top-right-radius: ${(props: any) => props.theme.borderRadius};
  flex-shrink: 0;
`;

const Image = styled(LazyImage)`
  width: 100%;
`;

const ContentWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 162px;
  margin-left: 20px;
`;

const Header = styled.header`
  overflow: hidden;
  margin: 0;
  margin-bottom: 10px;
`;

const Title = styled.h3`
  color: ${(props) => props.theme.colorText};
  font-size: ${fontSizes.large}px;
  font-weight: 500;
  line-height: normal;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-all;
`;

const Body = styled.div`
  flex-grow: 1;
`;

interface Props {
  to: string;
  image: string | null;
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
    {image && (
      <ImageWrapper>
        <Image src={image} alt="" />
      </ImageWrapper>
    )}

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
