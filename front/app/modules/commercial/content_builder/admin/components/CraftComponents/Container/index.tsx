import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import { UserComponent } from '@craftjs/core';
import Text from '../Text';
import Image from '../Image';
import AboutBox from '../AboutBox';
import Iframe from '../Iframe';
import Accordion from '../Accordion';
import TwoColumn from '../TwoColumn';
import ThreeColumn from '../ThreeColumn';
import WhiteSpace from '../WhiteSpace';
import ImageTextCards from '../../CraftSections/ImageTextCards';
import InfoWithAccordions from '../../CraftSections/InfoWithAccordions';

const Container: UserComponent = ({ children }) => {
  return (
    <Box id="e2e-single-column" minHeight="40px" w="100%">
      {children}
    </Box>
  );
};

Container.craft = {
  rules: {
    canMoveIn: (nodes) => {
      return nodes.every(
        (node) =>
          node.data.type === Text ||
          node.data.type === Image ||
          node.data.type === Iframe ||
          node.data.type === Accordion ||
          node.data.type === Container ||
          node.data.type === AboutBox ||
          node.data.type === TwoColumn ||
          node.data.type === ThreeColumn ||
          node.data.type === WhiteSpace ||
          node.data.type === ImageTextCards ||
          node.data.type === InfoWithAccordions
      );
    },
  },
};

export default Container;
