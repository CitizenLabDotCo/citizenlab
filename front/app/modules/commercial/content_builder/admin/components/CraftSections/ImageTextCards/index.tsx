import React from 'react';

// craft
import { UserComponent } from '@craftjs/core';
import Text from '../../CraftComponents/Text';
import TwoColumn from '../../CraftComponents/TwoColumn';
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

export default ImageTextCards;
