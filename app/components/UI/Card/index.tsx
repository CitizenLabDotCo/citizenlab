import React, { memo, MouseEvent } from 'react';
import bowser from 'bowser';

// components
import Link from 'utils/cl-router/Link';
import Image from 'components/UI/Image';

// styling
import styled from 'styled-components';
import {
  fontSizes,
  defaultCardStyle,
  defaultCardHoverStyle,
} from 'utils/styleUtils';

const Container = styled(Link)`
  width: 100%;
  height: 375px;
  margin-bottom: 24px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  position: relative;
  ${defaultCardStyle};

  &.desktop {
    ${defaultCardHoverStyle};
  }
`;

const CardImageWrapper = styled.div`
  height: 115px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-top-left-radius: ${(props: any) => props.theme.borderRadius};
  border-top-right-radius: ${(props: any) => props.theme.borderRadius};
`;

const CardImage = styled(Image)`
  width: 100%;
`;

const HeaderContentWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
`;

const Title = styled.h3<{ hasHeader: boolean }>`
  color: ${(props) => props.theme.colorText};
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
  header?: JSX.Element;
  title: JSX.Element | string;
  body?: JSX.Element | string;
  footer?: JSX.Element | string;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  className?: string;
}

export const Card = ({
  to,
  onClick,
  imageUrl,
  header,
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
    {imageUrl && (
      <CardImageWrapper>
        <CardImage src={imageUrl} alt="" />
      </CardImageWrapper>
    )}

    <Title className="e2e-card-title" hasHeader={!!header}>
      {title}
    </Title>
    <HeaderContentWrapper>{header}</HeaderContentWrapper>

    <Body>{body}</Body>
    <Footer aria-live="polite">{footer}</Footer>
  </Container>
);

export default memo<Props>(Card);
