import React from 'react';
import { withRouter } from 'react-router';
import { Editor as CraftEditor } from '@craftjs/core';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft

import Container from '../CraftComponents/Container';
import Text from '../CraftComponents/Text';
import TwoColumn from '../CraftComponents/TwoColumn';
import ThreeColumn from '../CraftComponents/ThreeColumn';
import RenderNode from '../RenderNode';

type EditorProps = {
  isPreview: boolean;
};

const Editor: React.FC<EditorProps> = ({ isPreview, children }) => {
  return (
    <CraftEditor
      resolver={{ Box, Container, TwoColumn, ThreeColumn, Text }}
      onRender={isPreview ? undefined : RenderNode}
    >
      {children}
    </CraftEditor>
  );
};

export default withRouter(Editor);
