import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import { UserComponent, Element } from '@craftjs/core';
import TwoColumn from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import Text from 'components/admin/ContentBuilder/Widgets/Text';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';
import Accordion from 'components/admin/ContentBuilder/Widgets/Accordion';
import Container from 'components/admin/ContentBuilder/Widgets/Container';

// intl
import accordionMessages from 'components/admin/ContentBuilder/Widgets/Accordion/messages';
import textMessages from 'components/admin/ContentBuilder/Widgets/Text/messages';
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';

type InfoWithAccordionsProps = WrappedComponentProps;

const InfoWithAccordions: UserComponent = ({
  intl: { formatMessage },
}: InfoWithAccordionsProps) => {
  return (
    <Element id="info-with-accordions" is={Box} canvas>
      <TwoColumn columnLayout="2-1">
        <Element id="left" is={Container} canvas>
          <Text text={formatMessage(textMessages.textValue)} />
        </Element>
        <Element id="right" is={Container} canvas>
          <Text text={formatMessage(textMessages.textValue)} />
        </Element>
      </TwoColumn>
      <WhiteSpace size="small" />
      <TwoColumn columnLayout="2-1">
        <Element id="left" is={Container} canvas>
          <Accordion
            title={formatMessage(accordionMessages.accordionTitleValue)}
            text={formatMessage(accordionMessages.accordionTextValue)}
          />
          <Accordion
            title={formatMessage(accordionMessages.accordionTitleValue)}
            text={formatMessage(accordionMessages.accordionTextValue)}
          />
          <Accordion
            title={formatMessage(accordionMessages.accordionTitleValue)}
            text={formatMessage(accordionMessages.accordionTextValue)}
          />
        </Element>
        <Element id="right" is={Container} canvas />
      </TwoColumn>
    </Element>
  );
};

export default injectIntl(InfoWithAccordions);
