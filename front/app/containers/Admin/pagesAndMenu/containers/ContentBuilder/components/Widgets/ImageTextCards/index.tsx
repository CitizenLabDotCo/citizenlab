import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Element } from '@craftjs/core';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';
import Container from 'components/admin/ContentBuilder/Widgets/Container';
import ImageMultiloc from 'components/admin/ContentBuilder/Widgets/ImageMultiloc';
import TwoColumn from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

import TextMultiloc from '../TextMultiloc';

// Since this is a composite widget, we treat it a bit differently
// (similar to how we separate the templates in the report builder)
const ImageTextCards = () => {
  const craftComponentDefaultPadding = useCraftComponentDefaultPadding();

  return (
    <Element
      id="image-text-cards"
      is={Box}
      canvas
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: `0px ${craftComponentDefaultPadding}`,
      }}
    >
      <TwoColumn columnLayout="1-2">
        <Element id="left" is={Container} canvas>
          <ImageMultiloc />
        </Element>
        <Element id="right" is={Container} canvas>
          <TextMultiloc />
        </Element>
      </TwoColumn>
      <WhiteSpace size="small" />
      <TwoColumn columnLayout="1-2">
        <Element id="left" is={Container} canvas>
          <ImageMultiloc />
        </Element>
        <Element id="right" is={Container} canvas>
          <TextMultiloc />
        </Element>
      </TwoColumn>
      <WhiteSpace size="small" />
      <TwoColumn columnLayout="1-2">
        <Element id="left" is={Container} canvas>
          <ImageMultiloc />
        </Element>
        <Element id="right" is={Container} canvas>
          <TextMultiloc />
        </Element>
      </TwoColumn>
    </Element>
  );
};

export default ImageTextCards;
