import React, { memo, MouseEvent } from 'react';

// components
import Image from 'components/UI/Image';
import Link from 'utils/cl-router/Link';
import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';
import {
  defaultCardStyle,
  defaultCardHoverStyle,
  media,
} from 'utils/styleUtils';

interface Props {
  id?: string;
  to: string;
  image?: string | null;
  imagePlaceholder?: JSX.Element;
  imageOverlay?: JSX.Element;
  author?: {
    name: string;
    id: string;
  } | null;
  title: string;
  body?: JSX.Element;
  interactions?: JSX.Element | null;
  footer: JSX.Element | null;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  className: string;
  innerHeight?: string;
}

const Container = styled(Link)`
  display: block;
  ${defaultCardStyle};
  cursor: pointer;
  ${defaultCardHoverStyle};
  width: 100%;
  display: flex;
  padding: 17px;

  ${media.tablet`
    flex-direction: column;
  `}
`;

const IdeaCardImageWrapper = styled.div<{ $cardInnerHeight: string }>`
  flex: 0 0 ${(props) => props.$cardInnerHeight};
  width: ${(props) => props.$cardInnerHeight};
  height: ${(props) => props.$cardInnerHeight};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 18px;
  overflow: hidden;
  border-radius: ${(props) => props.theme.borderRadius};

  ${media.tablet`
    width: 100%;
    margin-bottom: 18px;
  `}
`;

const IdeaCardImage = styled(Image)`
  width: 100%;
  height: 100%;
  flex: 1;
`;

export const Card = memo<Props>(
  ({
    id,
    to,
    image,
    imagePlaceholder,
    title,
    body,
    interactions,
    footer,
    className,
    onClick,
    innerHeight = '162px',
  }) => {
    const smallerThanTablet = useBreakpoint('tablet');

    return (
      <Container
        className={`e2e-card ${className}`}
        onClick={onClick}
        to={to}
        id={id}
      >
        {image && (
          <IdeaCardImageWrapper $cardInnerHeight={innerHeight}>
            <IdeaCardImage src={image} cover={true} alt="" />
          </IdeaCardImageWrapper>
        )}

        {!image && imagePlaceholder && (
          <IdeaCardImageWrapper $cardInnerHeight={innerHeight}>
            {imagePlaceholder}
          </IdeaCardImageWrapper>
        )}

        <Box
          ml="12px"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <Box mb={smallerThanTablet ? '24px' : undefined}>
            <Title variant="h3" mt="4px" mb="16px">
              {title}
            </Title>
            {body}
          </Box>
          <Box>
            {interactions}
            {footer}
          </Box>
        </Box>
      </Container>
    );
  }
);

export default Card;
