import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import { UserComponent, Element } from '@craftjs/core';

// widgets
import TwoColumn from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import Container from 'components/admin/ContentBuilder/Widgets/Container';
import Image from 'components/admin/ContentBuilder/Widgets/Image';
import Text from 'components/admin/ContentBuilder/Widgets/Text';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

// intl
import textMessages from 'components/admin/ContentBuilder/Widgets/Text/messages';
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';

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
          <Text text={formatMessage(textMessages.textValue)} />
        </Element>
      </TwoColumn>
      <WhiteSpace size="small" />
      <TwoColumn columnLayout="1-2">
        <Element id="left" is={Container} canvas>
          <Image alt="" />
        </Element>
        <Element id="right" is={Container} canvas>
          <Text text={formatMessage(textMessages.textValue)} />
        </Element>
      </TwoColumn>
      <WhiteSpace size="small" />
      <TwoColumn columnLayout="1-2">
        <Element id="left" is={Container} canvas>
          <Image alt="" />
        </Element>
        <Element id="right" is={Container} canvas>
          <Text text={formatMessage(textMessages.textValue)} />
        </Element>
      </TwoColumn>
    </Element>
  );
};

export default injectIntl(ImageTextCards);
