import React, { memo, MouseEvent } from 'react';
import styled from 'styled-components';
import bowser from 'bowser';
import Link from 'utils/cl-router/Link';
import LazyImage from 'components/LazyImage';
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

const Header = styled.div`
  width: 100%;
  height: 115px;
  position: relative;
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

const Title = styled.h3`
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
  line-height: 26px;
  max-height: 78px;
  margin: 0;
  margin-bottom: 13px;
  padding: 20px;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  /* &.extraTopPadding {
    padding-top: 75px;
  } */
`;

const Content = styled.div`
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
  title: string;
  content?: JSX.Element;
  footer?: JSX.Element;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  className?: string;
}

const Card = memo<Props>(({ to, onClick, imageUrl, imageAltText, title, content, footer, className }) => {
  return (
    <Container
      onClick={onClick}
      to={to}
      className={`${className} ${!(bowser.mobile || bowser.tablet) ? 'desktop' : 'mobile'}`}
    >
      <>
        {imageUrl &&
          <Header>
            <Image src={imageUrl} alt={imageAltText || ''} />
          </Header>
        }

        <Title>
          {title}
        </Title>

        <Content>
          {content}
        </Content>

        {footer &&
          <Footer>
            {footer}
          </Footer>
        }
      </>
    </Container>
  );
});

export default Card;
