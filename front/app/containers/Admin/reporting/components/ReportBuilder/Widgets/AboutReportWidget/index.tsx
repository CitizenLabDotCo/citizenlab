import React from 'react';

// craft
import { Element } from '@craftjs/core';
import { Box } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';

// components
import Container from 'components/admin/ContentBuilder/Widgets/Container';
import Text from 'components/admin/ContentBuilder/Widgets/Text';
import TenantLogo from '../../../../../../MobileNavbar/TenantLogo';
import { NoWidgetSettings } from 'components/admin/ContentBuilder/Widgets/NoWidgetSettings';

const AboutReportWidget = () => {
  const projectTitle = 'Report title';
  const project = 'Project name';
  const projectManager = 'bob';
  const projectPeriod = '12/03/2022 - 15/12/2022';

  // TODO: Initialise title from report settings
  const title = `
      <h1>${projectTitle}</h1>
    `;

  // TODO: Initialise text from report settings
  const text = `
      <ul>
        <li>Projects: ${project}</li>
        <li>Period: ${projectPeriod}</li>
        <li>Project manager: ${projectManager}</li>
      </ul>
    `;

  return (
    <Box>
      <Box
        width="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        m="10px"
      >
        <TenantLogo />
      </Box>
      <Element id="title-text" is={Container} canvas>
        <Text text={title} />
      </Element>
      <Element id="about-text" is={Container} canvas>
        <Text text={text} />
      </Element>
    </Box>
  );
};

AboutReportWidget.craft = {
  props: {},
  related: {
    settings: NoWidgetSettings,
  },
  custom: {
    title: messages.aboutThisReport,
  },
};

export default AboutReportWidget;
