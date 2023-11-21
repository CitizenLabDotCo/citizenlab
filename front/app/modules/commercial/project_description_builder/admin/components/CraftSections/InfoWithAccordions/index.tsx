import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import { UserComponent, Element } from '@craftjs/core';
import TwoColumn from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import TextMultiloc from 'components/admin/ContentBuilder/Widgets/TextMultiloc';
import AboutBox from 'components/admin/ContentBuilder/Widgets/AboutBox';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';
import AccordionMultiloc from 'components/admin/ContentBuilder/Widgets/AccordionMultiloc';
import Container from 'components/admin/ContentBuilder/Widgets/Container';

type InfoWithAccordionsProps = {
  projectId: string;
};

const InfoWithAccordions: UserComponent = ({
  projectId,
}: InfoWithAccordionsProps) => {
  return (
    <Element id="info-with-accordions" is={Box} canvas>
      <TwoColumn columnLayout="2-1">
        <Element id="left" is={Container} canvas>
          <TextMultiloc text={{}} />
        </Element>
        <Element id="right" is={Container} canvas>
          <AboutBox projectId={projectId} />
        </Element>
      </TwoColumn>
      <WhiteSpace size="small" />
      <TwoColumn columnLayout="2-1">
        <Element id="left" is={Container} canvas>
          <AccordionMultiloc title={{}} text={{}} />
          <AccordionMultiloc title={{}} text={{}} />
          <AccordionMultiloc title={{}} text={{}} />
        </Element>
        <Element id="right" is={Container} canvas />
      </TwoColumn>
    </Element>
  );
};

export default InfoWithAccordions;
