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
  // Rendered instead of `src` when `src` fails to load. Useful for image versions
  // that are not guaranteed to exist for uploads predating the version.
  fallbackSrc?: HTMLImageElement['src'];
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
  fallbackSrc,
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
  // Holds the src that failed rather than a boolean, so that a new `src` prop
  // retries the primary source instead of staying stuck on the fallback.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const usesFallback = !!fallbackSrc && failedSrc === src;

  const handleImageLoaded = () => {
    setLoaded(true);
  };

  const handleImageError = () => {
    // Skip when already on the fallback, so a failing fallback can't loop.
    if (fallbackSrc && !usesFallback) {
      setFailedSrc(src);
    }
  };

  return (
    <ImageElement
      src={usesFallback ? fallbackSrc : src}
      alt={alt}
      role={role}
      cover={cover}
      fadeIn={fadeIn}
      fadeInDuration={fadeInDuration}
      placeholderBg={placeholderBg}
      loaded={loaded}
      onLoad={handleImageLoaded}
      onError={handleImageError}
      id={id}
      className={className || ''}
      loading={isLazy ? 'lazy' : 'eager'}
    />
  );
};

export default Image;
