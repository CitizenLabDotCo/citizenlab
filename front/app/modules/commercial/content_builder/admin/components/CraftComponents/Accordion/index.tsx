import React from 'react';

// components
import QuillEditedContent from 'components/UI/QuillEditedContent';
import QuillEditor from 'components/UI/QuillEditor';

// craft
import { useNode } from '@craftjs/core';
import { Box } from '@citizenlab/cl2-component-library';

// hooks
import { useTheme } from 'styled-components';

const Accordion = ({ text }) => {
  const theme: any = useTheme();

  return (
    <Box id="e2e-text-box" minHeight="26px">
      <QuillEditedContent textColor={theme.colorText}>
        <div dangerouslySetInnerHTML={{ __html: text }} />
      </QuillEditedContent>
    </Box>
  );
};

const AccordionSettings = () => {
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

Accordion.craft = {
  props: {
    text: '',
  },
  related: {
    settings: AccordionSettings,
  },
};

export default Accordion;
