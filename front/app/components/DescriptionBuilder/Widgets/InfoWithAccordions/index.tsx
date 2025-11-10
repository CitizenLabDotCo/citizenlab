import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { UserComponent, Element } from '@craftjs/core';

import messages from 'containers/DescriptionBuilder/messages';

import AboutBox from 'components/admin/ContentBuilder/Widgets/AboutBox';
import AccordionMultiloc from 'components/admin/ContentBuilder/Widgets/AccordionMultiloc';
import Container from 'components/admin/ContentBuilder/Widgets/Container';
import TextMultiloc from 'components/admin/ContentBuilder/Widgets/TextMultiloc';
import TwoColumn from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

const InfoWithAccordions: UserComponent = () => {
  return (
    <Element id="info-with-accordions" is={Box} canvas>
      <TwoColumn columnLayout="2-1">
        <Element id="left" is={Container} canvas>
          <TextMultiloc text={{}} />
        </Element>
        <Element id="right" is={Container} canvas>
          <AboutBox />
        </Element>
      </TwoColumn>
      <WhiteSpace size="small" />
      <TwoColumn columnLayout="2-1">
        <Element id="left" is={Container} canvas>
          <AccordionMultiloc title={{}} />
          <AccordionMultiloc title={{}} />
          <AccordionMultiloc title={{}} />
        </Element>
        <Element id="right" is={Container} canvas />
      </TwoColumn>
    </Element>
  );
};

InfoWithAccordions.craft = {
  custom: {
    title: messages.infoWithAccordions,
    hasChildren: true,
  },
};

export const infoWithAccordionsTitle = messages.infoWithAccordions;

export default InfoWithAccordions;
