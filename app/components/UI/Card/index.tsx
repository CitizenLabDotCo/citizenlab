import React, { memo, MouseEvent } from 'react';
import bowser from 'bowser';

// components
import Link from 'utils/cl-router/Link';
import LazyImage from 'components/LazyImage';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

const Container = styled(Link)`
  width: 100%;
  height: 375px;
  margin-bottom: 24px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: #fff;
  position: relative;
  box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.06);

  &.desktop {
    transition: all 200ms ease;

    &:hover {
      box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.12);
      transform: translate(0px, -2px);
    }
  }
`;

const ImageWrapper = styled.div`
  height: 115px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-top-left-radius: ${(props: any) => props.theme.borderRadius};
  border-top-right-radius: ${(props: any) => props.theme.borderRadius};
`;

const Image = styled(LazyImage)`
  width: 100%;
`;

const HeaderContentWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
`;

const Title = styled.h3<({ hasHeader: boolean })>`
  color: #333;
  max-width: 400px;
  font-size: ${fontSizes.xl}px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-height: normal;
  margin: 0;
  margin-top: 20px;
  margin-bottom: 13px;
  padding: 0;
  padding-left: 20px;
  padding-right: 20px;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  &:first-child {
    margin-top: 20px;
  }
  ${({ hasHeader }) => hasHeader && '&:first-child { margin-top: 73px; }'}
`;
// why the :first-child ? -> to conteract the css reset that overrides top margin for h3:first-child.

const Body = styled.div`
  flex-grow: 1;
  padding-left: 20px;
  padding-right: 20px;
`;

const Footer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`;

interface Props {
  to: string;
  imageUrl?: string | null;
  imageAltText?: string | null;
  header?: JSX.Element;
  title: string;
  body?: JSX.Element;
  footer?: JSX.Element;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  className?: string;
}

const Card = memo<Props>(({ to, onClick, imageUrl, imageAltText, header, title, body, footer, className }) => (
  <Container
    onClick={onClick}
    to={to}
    className={`e2e-card ${className} ${!(bowser.mobile || bowser.tablet) ? 'desktop' : 'mobile'}`}
  >
    <>
      {imageUrl &&
        <ImageWrapper>
          <Image src={imageUrl} alt={imageAltText || ''} />
        </ImageWrapper>
      }

      <Title className="e2e-card-title" hasHeader={!!header}>
        {title}
      </Title>
      <HeaderContentWrapper>
        {header}
      </HeaderContentWrapper>

      <Body>
        {body}
      </Body>

      <Footer>
        {footer}
      </Footer>
    </>
  </Container>
));

export default Card;
