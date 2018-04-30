// Libraries
import React from 'react';

// Lazy Images observer
import { lazyImageObserver } from 'utils/lazyImagesObserver';

// Stylings
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Image: any = styled.img`
  background: ${colors.placeholderBg};
  transition: opacity .2s;
  opacity: 0;

  &.loaded{
    opacity: 1;
  }
`;

// Typings
export interface Props {
  src: HTMLImageElement['src'];
  alt?: HTMLImageElement['alt'];
  srcset?: HTMLImageElement['srcset'];
  role?: string;
  cover?: boolean;
}
export interface State {
  loaded: boolean;
}

export class LazyImage extends React.PureComponent<Props, State> {
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
    let { alt, role } = this.props;

    // A11y requires a role "presentation"  on images without any alt text
    if (!alt) {
      alt = '';
      role = 'presentation';
    }

    if (this.props.cover && !(window['CSS'] && CSS.supports('object-fit: cover'))) {
      // Legacy browsers, no lazy-loading for you!
      return <div className={this.props['className']} style={{ background: `center / cover no-repeat url("${this.props.src}")` }} />;
    } else {
      const style = this.props.cover ? { objectFit: 'cover', objectPosition: 'center' } as any : undefined;

      return (
        <Image
          src=""
          {...{ alt, role, style }}
          className={`${this.state.loaded ? 'loaded' : ''} ${this.props['className']}`}
          data-src={this.props.src}
          data-srcset={this.props.srcset || ''}
          innerRef={this.observeImage}
          onLoad={this.handleImageLoaded}
        />
      );
    }

  }
}

export default LazyImage;
