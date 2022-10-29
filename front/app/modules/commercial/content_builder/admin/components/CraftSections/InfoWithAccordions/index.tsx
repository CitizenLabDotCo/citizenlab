import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import { UserComponent, Element } from '@craftjs/core';
import TwoColumn from '../../CraftComponents/TwoColumn';
import Text from '../../CraftComponents/Text';
import AboutBox from '../../CraftComponents/AboutBox';
import WhiteSpace from '../../CraftComponents/WhiteSpace';
import Accordion from '../../CraftComponents/Accordion';
import Container from '../../CraftComponents/Container';

// intl
import messages from '../../../messages';
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';

type InfoWithAccordionsProps = {
  projectId: string;
} & WrappedComponentProps;

const InfoWithAccordions: UserComponent = ({
  intl: { formatMessage },
  projectId,
}: InfoWithAccordionsProps) => {
  return (
    <Element id="info-with-accordions" is={Box} canvas>
      <TwoColumn columnLayout="2-1">
        <Element id="left" is={Container} canvas>
          <Text text={formatMessage(messages.textValue)} />
        </Element>
        <Element id="right" is={Container} canvas>
          <AboutBox projectId={projectId} />
        </Element>
      </TwoColumn>
      <WhiteSpace size="small" />
      <TwoColumn columnLayout="2-1">
        <Element id="left" is={Container} canvas>
          <Accordion
            title={formatMessage(messages.accordionTitleValue)}
            text={formatMessage(messages.accordionTextValue)}
            openByDefault={false}
          />
          <Accordion
            title={formatMessage(messages.accordionTitleValue)}
            text={formatMessage(messages.accordionTextValue)}
            openByDefault={false}
          />
          <Accordion
            title={formatMessage(messages.accordionTitleValue)}
            text={formatMessage(messages.accordionTextValue)}
            openByDefault={false}
          />
        </Element>
        <Element id="right" is={Container} canvas />
      </TwoColumn>
    </Element>
  );
};

export default injectIntl(InfoWithAccordions);
