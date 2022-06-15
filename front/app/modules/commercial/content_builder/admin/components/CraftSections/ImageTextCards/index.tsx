import React from 'react';

// craft
import { UserComponent } from '@craftjs/core';
import Text from '../../CraftComponents/Text';
import { TwoColumn, TwoColumnSettings } from '../../CraftComponents/TwoColumn';
import Image from '../../CraftComponents/Image';

// These components must use different id's, as the Element used in the TwoColumn component requires this.
const ImageTextCards: UserComponent = ({ defaultText }) => {
  return (
    <div>
      <TwoColumn
        columnLayout="1-2"
        rightChildren={<Text text={defaultText} />}
        leftChildren={<Image alt="" />}
        rightId="firstRight"
        leftId="firstLeft"
      />
      <TwoColumn
        columnLayout="1-2"
        rightChildren={<Text text={defaultText} />}
        leftChildren={<Image alt="" />}
        rightId="secondRight"
        leftId="secondLeft"
      />
      <TwoColumn
        columnLayout="1-2"
        rightChildren={<Text text={defaultText} />}
        leftChildren={<Image alt="" />}
        rightId="thirdRight"
        leftId="thirdLeft"
      />
    </div>
  );
};

// Tested this as I saw it in the Craft example, but doesn't seem to help.
ImageTextCards.craft = {
  related: {
    settings: TwoColumnSettings,
  },
};

export default ImageTextCards;
