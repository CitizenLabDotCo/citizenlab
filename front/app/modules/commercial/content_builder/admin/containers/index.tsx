import React from 'react';
import { Frame, Element } from '@craftjs/core';
import { Box } from '@citizenlab/cl2-component-library';

const ContentBuilderPage = () => {
  return (
    <Frame>
      <Element canvas is={Box}>
        <h2>Drag me around</h2>
        <Element is="div" canvas>
          <p>Same here</p>
          <p>Same here</p>
        </Element>
      </Element>
    </Frame>
  );
};

export default ContentBuilderPage;
