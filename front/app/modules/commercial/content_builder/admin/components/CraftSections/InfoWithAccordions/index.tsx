import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import { UserComponent, Element } from '@craftjs/core';
import Accordion from '../../CraftComponents/Accordion';
import { TwoColumn } from '../../CraftComponents/TwoColumn';
import Text from '../../CraftComponents/Text';
import AboutBox from '../../CraftComponents/AboutBox';
import Container from '../../CraftComponents/Container';

const InfoWithAccordions: UserComponent = ({
  projectId,
  textPlaceholder,
  accordionTitle,
  accordionText,
}) => {
  return (
    <Element is={Container} canvas id="infoWithAccordions">
      <TwoColumn
        columnLayout="2-1"
        rightChildren={<AboutBox projectId={projectId} />}
        leftChildren={
          <Box>
            <Text text={textPlaceholder} />
            <Accordion
              title={accordionTitle}
              text={accordionText}
              openByDefault={false}
            />
            <Accordion
              title={accordionTitle}
              text={accordionText}
              openByDefault={false}
            />
            <Accordion
              title={accordionTitle}
              text={accordionText}
              openByDefault={false}
            />
          </Box>
        }
      />
    </Element>
  );
};

export default InfoWithAccordions;
