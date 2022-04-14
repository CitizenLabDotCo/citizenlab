import React from 'react';

// components
import QuillEditedContent from 'components/UI/QuillEditedContent';
import QuillEditor from 'components/UI/QuillEditor';

// craft
import { useNode } from '@craftjs/core';
import { Box } from '@citizenlab/cl2-component-library';

// hooks
import { useTheme } from 'styled-components';

const Text = ({ text }) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  const theme: any = useTheme();

  return (
    <Box minHeight="26px" ref={(ref: any) => connect(drag(ref))}>
      <QuillEditedContent textColor={theme.colorText}>
        <div dangerouslySetInnerHTML={{ __html: text }} />
      </QuillEditedContent>
    </Box>
  );
};

const TextSettings = () => {
  const {
    actions: { setProp },
    text,
  } = useNode((node) => ({
    text: node.data.props.text,
  }));

  return (
    <Box background="#ffffff" marginBottom="20px">
      <QuillEditor
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

Text.craft = {
  props: {
    text: '',
  },
  related: {
    settings: TextSettings,
  },
};

export default Text;
