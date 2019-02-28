// Libraries
import React, { PureComponent } from 'react';

// Lazy Images observer
import { lazyImageObserver } from 'utils/lazyImagesObserver';

// Stylings
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Image: any = styled.img`
  background: ${colors.placeholderBg};
  transition: opacity 200ms ease-out;
  opacity: 0;

  &.loaded{
    opacity: 1;
  }
`;

export interface Props {
  src: HTMLImageElement['src'];
  alt?: HTMLImageElement['alt'];
  srcset?: HTMLImageElement['srcset'];
  role?: string;
  cover?: boolean;
  className?: string;
}
export interface State {
  loaded: boolean;
}

export class LazyImage extends PureComponent<Props, State> {
  image: HTMLImageElement | null;

  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
    };
  }

  observeImage = (image: HTMLImageElement) => {
    if (image) {
      lazyImageObserver.observe(image);
      this.image = image;
    } else if (this.image) {
      lazyImageObserver.unobserve(this.image);
    }
  }

  handleImageLoaded = () => {
    this.setState({ loaded: true });
  }

  render() {
    const { src, srcset, cover, className } = this.props;
    let { alt, role } = this.props;
    const { loaded } = this.state;

    // A11y requires a role "presentation" on images without any alt text
    if (!alt) {
      alt = '';
      role = 'presentation';
    }

    if (cover && !(window['CSS'] && CSS.supports('object-fit: cover'))) {
      // Legacy browsers, no lazy-loading for you!
      return <div className={className} style={{ background: `center / cover no-repeat url("${src}")` }} />;
    } else {
      const style = cover ? { objectFit: 'cover', objectPosition: 'center' } as any : undefined;

      return (
        <Image
          src=""
          {...{ alt, role, style }}
          className={`${loaded ? 'loaded' : ''} ${className}`}
          data-src={src}
          data-srcset={srcset || ''}
          innerRef={this.observeImage}
          onLoad={this.handleImageLoaded}
        />
      );
    }

  }
}

export default LazyImage;
