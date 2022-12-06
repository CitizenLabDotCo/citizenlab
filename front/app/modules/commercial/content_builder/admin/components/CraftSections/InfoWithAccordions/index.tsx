import React from 'react';
import { WrappedComponentProps } from 'react-intl';
// components
import { Box } from '@citizenlab/cl2-component-library';
// craft
import { UserComponent, Element } from '@craftjs/core';
import { injectIntl } from 'utils/cl-intl';
// intl
import messages from '../../../messages';
import AboutBox from '../../CraftComponents/AboutBox';
import Accordion from '../../CraftComponents/Accordion';
import Container from '../../CraftComponents/Container';
import Text from '../../CraftComponents/Text';
import TwoColumn from '../../CraftComponents/TwoColumn';
import WhiteSpace from '../../CraftComponents/WhiteSpace';

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
