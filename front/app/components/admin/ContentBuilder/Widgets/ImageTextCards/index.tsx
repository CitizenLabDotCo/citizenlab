import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import { UserComponent, Element, useNode } from '@craftjs/core';

// widgets
import TwoColumn from '../TwoColumn';
import Container from '../Container';
import ImageMultiloc from 'components/admin/ContentBuilder/Widgets/ImageMultiloc';
import TextMultiloc from 'components/admin/ContentBuilder/Widgets/TextMultiloc';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';
import useCraftComponentDefaultPadding from '../../useCraftComponentDefaultPadding';

const ImageTextCards: UserComponent = () => {
  const { parent } = useNode((node) => ({
    parent: node.data.parent,
  }));
  const componentDefaultPadding = useCraftComponentDefaultPadding(parent);

  return (
    <Element
      id="image-text-cards"
      is={Box}
      canvas
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: componentDefaultPadding,
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
