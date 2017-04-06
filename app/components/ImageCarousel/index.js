/**
*
* ImageCarousel
*
*/

import React from 'react';
// import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';
import messages from './messages';

function ImageCarousel() {
  return (
    <div>
      <FormattedMessage {...messages.header} />
    </div>
  );
}

ImageCarousel.propTypes = {

};

export default ImageCarousel;
