import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import { UserComponent, Element } from '@craftjs/core';
import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';

// widgets
import TwoColumn from '../TwoColumn';
import Container from '../Container';
import ImageMultiloc from 'components/admin/ContentBuilder/Widgets/ImageMultiloc';
import TextMultiloc from 'components/admin/ContentBuilder/Widgets/TextMultiloc';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

const ImageTextCards: UserComponent = () => {
  const craftComponentDefaultPadding = useCraftComponentDefaultPadding();

  return (
    <Element
      id="image-text-cards"
      is={Box}
      canvas
      style={{
        maxWidth: '1150px',
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
