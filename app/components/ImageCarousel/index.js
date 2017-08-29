/**
*
* ImageCarousel
*
*/

import React, { PropTypes } from 'react';
import { Carousel } from 'react-responsive-carousel';
// eslint-disable-next-line no-unused-vars
import styles from 'react-responsive-carousel/lib/styles/carousel.css';

function ImageCarousel(props) {
  const { ideaImages } = props;

  return (
    <div>
      <Carousel axis="horizontal" showThumbs showArrows dynamicHeight autoPlay>
        {ideaImages.map((ideaImage) => (<div key={`image-container-${ideaImage.id}`}>
          <img
            role="presentation"
            src={ideaImage.medium}
          />
        </div>))}
      </Carousel>
    </div>
  );
}

ImageCarousel.propTypes = {
  ideaImages: PropTypes.array.isRequired,
};

export default ImageCarousel;
