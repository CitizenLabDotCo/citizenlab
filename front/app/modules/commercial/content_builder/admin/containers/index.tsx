import React from 'react';
import { Frame, Element } from '@craftjs/core';
import CraftContainer from '../components/CraftContainer';

const ContentBuilderPage = () => {
  return (
    <Frame>
      <Element canvas is={CraftContainer}>
        <h2>Drag me around</h2>
        <Element is={CraftContainer} canvas>
          <p>Same here</p>
          <p>Same here</p>
        </Element>
      </Element>
    </Frame>
  );
};

export default ContentBuilderPage;
