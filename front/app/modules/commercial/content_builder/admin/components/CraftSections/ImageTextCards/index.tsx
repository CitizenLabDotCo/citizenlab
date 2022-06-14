import React from 'react';

// craft
import { UserComponent, Element } from '@craftjs/core';
import Container from '../../CraftComponents/Container';
import Image from '../../CraftComponents/Image';
import Text from '../../CraftComponents/Text';
import TwoColumn from '../../CraftComponents/TwoColumn';
import { Box } from '@citizenlab/cl2-component-library';

const ImageTextCards: UserComponent = ({ defaultText }) => {
  return (
    <Element canvas id="container" is={Container}>
      <Element
        canvas
        id="twoColumn"
        is={TwoColumn}
        columnLayout={'1-2'}
        firstColumnChildren={React.createElement(Image)}
        secondColumnChildren={React.createElement(Text, { text: defaultText })}
      />
      <Element
        canvas
        id="twoColumn"
        is={TwoColumn}
        columnLayout={'1-2'}
        firstColumnChildren={React.createElement(Image)}
        secondColumnChildren={React.createElement(Text, { text: defaultText })}
      />
      <Element
        canvas
        id="twoColumn"
        is={TwoColumn}
        columnLayout={'1-2'}
        firstColumnChildren={React.createElement(Image)}
        secondColumnChildren={React.createElement(Text, { text: defaultText })}
      />
    </Element>
  );
};

const ImageTextCardsSettings = () => {
  return <Box />;
};

ImageTextCards.craft = {
  related: {
    settings: ImageTextCardsSettings,
  },
};

export default ImageTextCards;
