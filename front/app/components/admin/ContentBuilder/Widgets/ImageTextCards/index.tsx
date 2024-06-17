import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { UserComponent, Element } from '@craftjs/core';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';
import ImageMultiloc from 'components/admin/ContentBuilder/Widgets/ImageMultiloc';
import TextMultiloc from 'components/admin/ContentBuilder/Widgets/TextMultiloc';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

import Container from '../Container';
import TwoColumn from '../TwoColumn';

const ImageTextCards: UserComponent = () => {
  const craftComponentDefaultPadding = useCraftComponentDefaultPadding();

  return (
    <Element
      className="image-text-cards"
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
