// Libraries
import React from 'react';

// Lazy Images observer
import { lazyImageObserver } from 'utils/lazyImagesObserver';

// Typings
export interface Props {
  src: string;
  alt?: string;
  role?: string;
  srcset?: string;
}
export interface State {}

export class LazyImage extends React.PureComponent<Props, State> {
  image: HTMLImageElement | null;

  constructor(props) {
    super(props);
    this.state = {};
  }

  observeImage = (image: HTMLImageElement) => {
    if (image) {
      lazyImageObserver.observe(image);
      this.image = image;
    } else if (this.image) {
      lazyImageObserver.unobserve(this.image);
    }
  }

  render() {
    let { alt, role } = this.props;

    // A11y requires a role "presentation"  on images without any alt text
    if (!alt) {
      alt = '';
      role = 'presentation';
    }

    return (
      <img src="" className={this.props['className']} data-src={this.props.src} data-srcset={this.props.srcset || ''} {...{ alt, role }} ref={this.observeImage} />
    );
  }
}

export default LazyImage;
