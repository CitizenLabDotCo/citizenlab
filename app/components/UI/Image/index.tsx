// Libraries
import React, { PureComponent } from 'react';

// Lazy Images observer
import Observer from '@researchgate/react-intersection-observer';

// Stylings
import styled, { css } from 'styled-components';
import { colors } from 'utils/styleUtils';

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

const Fallback = styled.div<{ src: string | undefined }>`
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  background-image: url(${({ src }) => src});
`;

interface Props {
  id?: string;
  src: HTMLImageElement['src'];
  alt?: HTMLImageElement['alt'];
  role?: string;
  cover?: boolean;
  fadeIn?: boolean;
  fadeInDuration?: number;
  placeholderBg?: string;
  isLazy?: boolean;
  className?: string;
}

interface State {
  visible: boolean;
  loaded: boolean;
}

export default class Image extends PureComponent<Props, State> {
  static defaultProps = {
    alt: '',
    fadeIn: true,
    placeholderBg: colors.placeholderBg,
    isLazy: true,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      visible: props.isLazy ? false : true,
      loaded: false,
    };
  }

  handleIntersection = (
    event: IntersectionObserverEntry,
    unobserve: () => void
  ) => {
    if (event.isIntersecting) {
      this.setState({ visible: true });
      unobserve();
    }
  };

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
    const { visible, loaded } = this.state;

    let image = (
      <ImageElement
        src={visible ? src : undefined}
        alt={alt}
        role={role}
        cover={!!cover}
        fadeIn={!!fadeIn}
        fadeInDuration={fadeInDuration}
        placeholderBg={placeholderBg}
        loaded={loaded}
        onLoad={this.handleImageLoaded}
        id={id || ''}
        className={className || ''}
      />
    );

    if (cover && !(window['CSS'] && CSS.supports('object-fit: cover'))) {
      image = <Fallback src={src} className={className} />;
    }

    if (isLazy) {
      return (
        <Observer rootMargin="200px" onChange={this.handleIntersection}>
          {image}
        </Observer>
      );
    }

    return image;
  }
}
