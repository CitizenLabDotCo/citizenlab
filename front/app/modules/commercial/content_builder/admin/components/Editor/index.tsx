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
import Image from '../CraftComponents/Image';
import RenderNode from '../RenderNode';
import AboutBox from '../CraftComponents/AboutBox';

type EditorProps = {
  isPreview: boolean;
};

const Editor: React.FC<EditorProps> = ({ isPreview, children }) => {
  return (
    <CraftEditor
      resolver={{
        Box,
        Container,
        TwoColumn,
        ThreeColumn,
        Text,
        Image,
        AboutBox,
      }}
      onRender={isPreview ? undefined : RenderNode}
      enabled={isPreview ? false : true}
    >
      {children}
    </CraftEditor>
  );
};

export default withRouter(Editor);
