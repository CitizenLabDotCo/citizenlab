// Libraries
import React, { PureComponent } from 'react';

// Stylings
import styled, { css } from 'styled-components';
import { colors } from '@citizenlab/cl2-component-library';

const Fallback = styled.div<{ src: string | undefined }>`
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  background-image: url(${({ src }) => src});
`;

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

interface State {
  loaded: boolean;
}

export default class Image extends PureComponent<Props, State> {
  static defaultProps = {
    alt: '',
    fadeIn: true,
    placeholderBg: colors.background,
    isLazy: true,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      loaded: false,
    };
  }

  handleImageLoaded = () => {
    this.setState({ loaded: true });
  };

  render() {
    const {
      id,
      src,
      alt,
      role,
      cover,
      fadeIn,
      fadeInDuration,
      placeholderBg,
      className,
    } = this.props;
    const { isLazy } = this.props;
    const { loaded } = this.state;

    let image = (
      <ImageElement
        src={src}
        alt={alt}
        role={role}
        cover={!!cover}
        fadeIn={!!fadeIn}
        fadeInDuration={fadeInDuration}
        placeholderBg={placeholderBg}
        loaded={loaded}
        onLoad={this.handleImageLoaded}
        id={id}
        className={className || ''}
        loading={isLazy ? 'lazy' : 'eager'}
      />
    );

    if (cover) {
      image = <Fallback src={src} className={className} />;
    }

    return image;
  }
}
