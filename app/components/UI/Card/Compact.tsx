import React, { memo, MouseEvent } from 'react';
import bowser from 'bowser';

// components
import Link from 'utils/cl-router/Link';
import Image from 'components/UI/Image';

// styling
import styled from 'styled-components';
import {
  defaultCardStyle,
  defaultCardHoverStyle,
  media,
} from 'utils/styleUtils';

const cardPadding = '17px';
const cardInnerHeight = '162px';
const cardInnerHeightExtended = '180px';

const Container = styled(Link)`
  width: 100%;
  min-height: calc(${cardInnerHeight} + ${cardPadding} + ${cardPadding});
  display: flex;
  align-items: center;
  padding: ${cardPadding};
  cursor: pointer;
  ${defaultCardStyle};

  &.desktop {
    ${defaultCardHoverStyle};
    transform: translate(0px, -2px);
  }

  @media (max-width: 1220px) and (min-width: 1023px) {
    min-height: calc(
      ${cardInnerHeightExtended} + ${cardPadding} + ${cardPadding}
    );
  }

  ${media.smallerThanMinTablet`
    min-height: unset;
    flex-direction: column;
    align-items: stretch;
  `}
`;

const IdeaCardImageWrapper = styled.div<{ hasImage: boolean }>`
  flex: 0 0 ${cardInnerHeight};
  width: ${cardInnerHeight};
  height: ${cardInnerHeight};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 18px;
  overflow: hidden;
  border-radius: ${(props: any) => props.theme.borderRadius};

  @media (max-width: 1220px) and (min-width: 1023px) {
    height: ${cardInnerHeightExtended};
  }

  ${media.smallerThanMinTablet`
    width: 100%;
    margin-bottom: 18px;
  `}
`;

const IdeaCardImage = styled(Image)`
  width: 100%;
  height: 100%;
  flex: 1;
`;

const ContentWrapper = styled.div`
  height: ${cardInnerHeight};
  flex: 0 1 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-top: 0px;
  padding-bottom: 2px;

  @media (max-width: 1220px) and (min-width: 1023px) {
    height: ${cardInnerHeightExtended};
  }

  ${media.smallerThanMinTablet`
    height: unset;
  `}
`;

const Header = styled.header`
  padding: 0;
  margin: 0;
  margin-bottom: 12px;

  ${media.smallerThanMinTablet`
    margin-bottom: 15px;
  `}
`;

const Title = styled.h3`
  color: ${(props) => props.theme.colorText};
  font-size: 21px;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-height: 26px;
  max-height: 78px;
  padding: 0;
  margin: 0;
  overflow: hidden;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;

const Body = styled.div`
  flex-grow: 1;

  ${media.smallerThanMinTablet`
    margin-bottom: 25px;
  `}
`;

interface Props {
  to: string;
  image: string | null;
  imagePlaceholder: JSX.Element;
  hideImage?: boolean;
  hideImagePlaceholder?: boolean;
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

export const Card = memo<Props>(
  ({
    to,
    onClick,
    image,
    imagePlaceholder,
    hideImage,
    hideImagePlaceholder,
    title,
    body,
    footer,
    className,
  }) => (
    <Container
      onClick={onClick}
      to={to}
      className={`e2e-card ${className} ${
        !(bowser.mobile || bowser.tablet) ? 'desktop' : 'mobile'
      }`}
    >
      {!hideImage && image && (
        <IdeaCardImageWrapper hasImage={!!image}>
          <IdeaCardImage src={image} cover={true} alt="" />
        </IdeaCardImageWrapper>
      )}

      {!hideImagePlaceholder && !image && (
        <IdeaCardImageWrapper hasImage={!!image}>
          {imagePlaceholder}
        </IdeaCardImageWrapper>
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
  )
);

export default Card;
