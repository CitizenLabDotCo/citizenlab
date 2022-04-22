import React from 'react';

// components
import { Box, Input } from '@citizenlab/cl2-component-library';
import Iframe from 'react-iframe';

// craft
import { useNode } from '@craftjs/core';

const CraftIframe = ({ url, height }) => {
  return (
    <Box minHeight="26px">
      <Iframe url={url} height={height} width="100%" />
    </Box>
  );
};

const CraftIframeSettings = () => {
  const {
    actions: { setProp },
    url,
    height,
  } = useNode((node) => ({
    url: node.data.props.url,
    height: node.data.props.height,
  }));

  return (
    <Box marginBottom="20px">
      <Input
        label="URL"
        type="text"
        value={url}
        onChange={(value) => {
          setProp((props) => (props.url = value));
        }}
      />
      <Input
        label="Height"
        type="text"
        value={height}
        onChange={(value) => {
          setProp((props) => (props.height = value));
        }}
      />
    </Box>
  );
};

CraftIframe.craft = {
  props: {
    url: '',
    height: '',
  },
  related: {
    settings: CraftIframeSettings,
  },
};

export default CraftIframe;
