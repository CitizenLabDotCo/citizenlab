import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import { Element, UserComponent } from '@craftjs/core';
import Container from '../../CraftComponents/Container';
import Image from '../../CraftComponents/Image';
import Text from '../../CraftComponents/Text';
import TwoColumn from '../../CraftComponents/TwoColumn';

// intl
import { injectIntl, WrappedComponentProps } from 'react-intl';
import messages from '../../../messages';
import WhiteSpace from '../../CraftComponents/WhiteSpace';

const ImageTextCards: UserComponent = ({
  intl: { formatMessage },
}: WrappedComponentProps) => {
  return (
    <Element id="image-text-cards" is={Box} canvas>
      <TwoColumn columnLayout="1-2">
        <Element id="left" is={Container} canvas>
          <Image alt="" />
        </Element>
        <Element id="right" is={Container} canvas>
          <Text text={formatMessage(messages.textValue)} />
        </Element>
      </TwoColumn>
      <WhiteSpace size="small" />
      <TwoColumn columnLayout="1-2">
        <Element id="left" is={Container} canvas>
          <Image alt="" />
        </Element>
        <Element id="right" is={Container} canvas>
          <Text text={formatMessage(messages.textValue)} />
        </Element>
      </TwoColumn>
      <WhiteSpace size="small" />
      <TwoColumn columnLayout="1-2">
        <Element id="left" is={Container} canvas>
          <Image alt="" />
        </Element>
        <Element id="right" is={Container} canvas>
          <Text text={formatMessage(messages.textValue)} />
        </Element>
      </TwoColumn>
    </Element>
  );
};

export default injectIntl(ImageTextCards);
