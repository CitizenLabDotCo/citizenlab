// Libraries
import React, { PureComponent } from 'react';

// Lazy Images observer
import Observer from '@researchgate/react-intersection-observer';

// Stylings
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Image = styled.img`
  background: ${colors.placeholderBg};
  transition: opacity 200ms ease-out;
  opacity: 0;

  &.loaded {
    opacity: 1;
  }
`;

interface Props {
  src: HTMLImageElement['src'];
  alt?: HTMLImageElement['alt'];
  role?: string;
  cover?: boolean;
  className?: string;
}

interface State {
  visible: boolean;
  loaded: boolean;
}

export default class LazyImage extends PureComponent<Props, State> {
  static defaultProps = {
    alt: '',
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      loaded: false,
    };
  }

  handleIntersection = (event: IntersectionObserverEntry, unobserve: () => void) => {
    if (event.isIntersecting) {
      this.setState({ visible: true });
      unobserve();
    }
  }

  handleImageLoaded = () => {
    this.setState({ loaded: true });
  }

  render() {
    const { src, alt, role, cover, className } = this.props;
    const { visible, loaded } = this.state;

    if (cover && !(window['CSS'] && CSS.supports('object-fit: cover'))) {
      // Legacy browsers, no lazy-loading for you!
      return <div className={className} style={{ background: `center / cover no-repeat url("${src}")` }} />;
    } else {
      const style = cover ? { objectFit: 'cover', objectPosition: 'center' } as any : undefined;

      return (
        <Observer onChange={this.handleIntersection}>
          <Image
            src={visible ? src : undefined}
            alt={alt}
            role={role}
            style={style}
            className={`${visible ? 'visible' : ''} ${loaded ? 'loaded' : ''} ${className}`}
            onLoad={this.handleImageLoaded}
          />
        </Observer>
      );
    }
  }
}
