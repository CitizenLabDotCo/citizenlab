import React from 'react';

// craft
import { UserComponent, Element } from '@craftjs/core';
import Accordion from '../../CraftComponents/Accordion';
import TwoColumn from '../../CraftComponents/TwoColumn';
import Text from '../../CraftComponents/Text';
import AboutBox from '../../CraftComponents/AboutBox';
import Container from '../../CraftComponents/Container';

const InfoWithAccordions: UserComponent = ({
  projectId,
  textPlaceholder,
  accordionTitle,
  accordionText,
}) => {
  const leftChildren = <Element is={Text} id="text" text={textPlaceholder} />;
  const rightChildren = (
    <Element is={AboutBox} id="aboutBox" projectId={projectId} />
  );

  return (
    <Element canvas is={Container} id="container">
      <Element
        canvas
        is={TwoColumn}
        id="twoColumn"
        columnLayout="2-1"
        rightChildren={rightChildren}
        leftChildren={leftChildren}
      />
      <Element
        id="accordion"
        is={Accordion}
        title={accordionTitle}
        text={accordionText}
        openByDefault={false}
      />
      <Element
        id="accordion2"
        is={Accordion}
        title={accordionTitle}
        text={accordionText}
        openByDefault={false}
      />
      <Element
        id="accordion3"
        is={Accordion}
        title={accordionTitle}
        text={accordionText}
        openByDefault={false}
      />
    </Element>
  );
};

export default InfoWithAccordions;
