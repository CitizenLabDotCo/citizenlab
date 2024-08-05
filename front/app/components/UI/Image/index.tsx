import React, { useState } from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import styled, { css } from 'styled-components';

const ImageElement = styled.img<{
  cover: boolean;
  fadeIn: boolean;
  fadeInDuration: number | undefined;
  placeholderBg?: string;
  loaded: boolean;
}>`
  background: ${(props) => props.placeholderBg};

  ${(props) =>
    props.cover &&
    css`
      object-fit: cover;
      object-position: center center;
    `}

  ${(props) =>
    props.fadeIn &&
    css`
      transition: opacity ${props.fadeInDuration || 130}ms ease-out;
      opacity: ${props.loaded ? 1 : 0};
    `};
`;

interface Props {
  id?: string;
  src: HTMLImageElement['src'];
  alt: HTMLImageElement['alt'];
  role?: string;
  cover?: boolean;
  fadeIn?: boolean;
  fadeInDuration?: number;
  placeholderBg?: string;
  isLazy?: boolean;
  className?: string;
}

const Image: React.FC<Props> = ({
  id,
  src,
  alt,
  role,
  cover = false,
  fadeIn = true,
  fadeInDuration,
  placeholderBg = colors.background,
  isLazy = true,
  className,
}) => {
  const [loaded, setLoaded] = useState(false);

  const handleImageLoaded = () => {
    setLoaded(true);
  };

  return (
    <ImageElement
      src={src}
      alt={alt}
      role={role}
      cover={cover}
      fadeIn={fadeIn}
      fadeInDuration={fadeInDuration}
      placeholderBg={placeholderBg}
      loaded={loaded}
      onLoad={handleImageLoaded}
      id={id}
      className={className || ''}
      loading={isLazy ? 'lazy' : 'eager'}
    />
  );
};

export default Image;
