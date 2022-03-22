import React from 'react';

// components
import QuillEditedContent from 'components/UI/QuillEditedContent';
import QuillEditor from 'components/UI/QuillEditor';

// craft
import { useNode } from '@craftjs/core';

const Text = ({ text }) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  return (
    <div ref={(ref: any) => connect(drag(ref))}>
      <QuillEditedContent>
        <div dangerouslySetInnerHTML={{ __html: text }} />
      </QuillEditedContent>
    </div>
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
    <div>
      <QuillEditor
        noImages
        id="quill-editor"
        value={text}
        onChange={(value) => {
          setProp((props) => (props.text = value));
        }}
      />
    </div>
  );
};

Text.craft = {
  props: {
    text: 'Textbox',
  },
  related: {
    settings: TextSettings,
  },
};

export default Text;
