import React from 'react';
import styled from 'styled-components';

// components
import QuillEditedContent from 'components/UI/QuillEditedContent';
import QuillEditor from 'components/UI/QuillEditor';

// craft
import { useNode } from '@craftjs/core';
import { Box } from '@citizenlab/cl2-component-library';

const StyledTextBox = styled(Box)`
  &:hover {
    cursor: move;
  }
`;

const Text = ({ text }) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  return (
    <StyledTextBox minHeight="26px" ref={(ref: any) => connect(drag(ref))}>
      <QuillEditedContent>
        <div dangerouslySetInnerHTML={{ __html: text }} />
      </QuillEditedContent>
    </StyledTextBox>
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
