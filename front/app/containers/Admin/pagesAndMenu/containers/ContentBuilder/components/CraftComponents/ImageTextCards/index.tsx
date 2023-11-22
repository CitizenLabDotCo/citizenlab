import React from 'react';

// components
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

// craft
import { UserComponent, Element, useNode } from '@craftjs/core';

// widgets
import TwoColumn from '../TwoColumn';
import Container from '../Container';
import ImageMultiloc from 'components/admin/ContentBuilder/Widgets/ImageMultiloc';
import TextMultiloc from 'components/admin/ContentBuilder/Widgets/TextMultiloc';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';
import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

const ImageTextCards: UserComponent = () => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const { parent } = useNode((node) => ({
    parent: node.data.parent,
  }));

  return (
    <Element
      id="image-text-cards"
      is={Box}
      canvas
      style={{
        maxWidth: '1150px',
        margin: '0 auto',
        padding:
          isSmallerThanTablet && parent === 'ROOT'
            ? `0px ${DEFAULT_PADDING}`
            : '0px',
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
