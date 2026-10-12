import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { Multiloc } from 'typings';

import QuillMutilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';

const Settings = () => {
  const {
    actions: { setProp },
    text,
  } = useNode((node) => ({
    text: node.data.props.text,
  }));

  return (
    <Box background="#ffffff" marginBottom="20px">
      <QuillMutilocWithLocaleSwitcher
        maxHeight="300px"
        noImages
        noVideos
        id="quill-editor"
        valueMultiloc={text}
        onChange={(value) => {
          setProp((props: { text?: Multiloc }) => (props.text = value));
        }}
      />
    </Box>
  );
};

export default Settings;
