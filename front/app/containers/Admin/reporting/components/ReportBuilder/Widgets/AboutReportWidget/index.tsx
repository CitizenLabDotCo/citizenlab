import React from 'react';

// components
import QuillEditor from 'components/UI/QuillEditor';

// craft
import { Element, useNode } from '@craftjs/core';
import { Box } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';

// hooks
import Container from '../../../../../../../components/admin/ContentBuilder/Widgets/Container';
import Text from '../../../../../../../components/admin/ContentBuilder/Widgets/Text';
import TenantLogo from '../../../../../../MobileNavbar/TenantLogo';

const AboutReportWidget = ({ title, text }) => {
  const projectTitle = 'Report title';
  const project = 'Project name';
  const projectManager = 'bob';
  const projectPeriod = '12/03/2022 - 15/12/2022';

  let titleVal = title;
  if (title === null) {
    // Initialise title from defaults
    titleVal = `
      <h1>${projectTitle}</h1>
    `;
  }

  let textVal = text;
  if (text === null) {
    // Initialise text from defaults
    textVal = `
      <ul>
        <li>Projects: ${project}</li>
        <li>Period: ${projectPeriod}</li>
        <li>Project manager: ${projectManager}</li>
      </ul>
    `;
  }

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
        <Text text={titleVal} />
      </Element>
      <Element id="about-text" is={Container} canvas>
        <Text text={textVal} />
      </Element>
    </Box>
  );
};

const AboutReportWidgetSettings = () => {
  const {
    actions: { setProp },
    text,
  } = useNode((node) => ({
    text: node.data.props.text,
  }));

  return (
    <Box background="#ffffff" marginBottom="20px">
      <QuillEditor
        maxHeight="300px"
        noImages
        noVideos
        id="quill-editor"
        value={text}
        onChange={(value) => {
          setProp((props) => (props.text = value));
        }}
      />
    </Box>
  );
};

AboutReportWidget.craft = {
  props: {
    text: '',
  },
  related: {
    settings: AboutReportWidgetSettings,
  },
  custom: {
    title: messages.aboutThisReport,
  },
};

export default AboutReportWidget;
