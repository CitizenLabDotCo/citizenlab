import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import { UserComponent, Element } from '@craftjs/core';

// widgets
import TwoColumn from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import Container from 'components/admin/ContentBuilder/Widgets/Container';
import Image from 'components/admin/ContentBuilder/Widgets/Image';
import TextMultiloc from 'components/admin/ContentBuilder/Widgets/TextMultiloc';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

const ImageTextCards: UserComponent = () => {
  return (
    <Element id="image-text-cards" is={Box} canvas>
      <TwoColumn columnLayout="1-2">
        <Element id="left" is={Container} canvas>
          <Image alt="" />
        </Element>
        <Element id="right" is={Container} canvas>
          <TextMultiloc text={{}} />
        </Element>
      </TwoColumn>
      <WhiteSpace size="small" />
      <TwoColumn columnLayout="1-2">
        <Element id="left" is={Container} canvas>
          <Image alt="" />
        </Element>
        <Element id="right" is={Container} canvas>
          <TextMultiloc text={{}} />
        </Element>
      </TwoColumn>
      <WhiteSpace size="small" />
      <TwoColumn columnLayout="1-2">
        <Element id="left" is={Container} canvas>
          <Image alt="" />
        </Element>
        <Element id="right" is={Container} canvas>
          <TextMultiloc text={{}} />
        </Element>
      </TwoColumn>
    </Element>
  );
};

export default ImageTextCards;
