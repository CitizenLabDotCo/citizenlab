import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import {
  Editor as CraftEditor,
  SerializedNodes,
  Resolver,
} from '@craftjs/core';

import RenderNode from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Editor/RenderNode';

import { useVerticalRhythmMargin } from 'components/admin/ContentBuilder/verticalRhythm';

type EditorProps = {
  isPreview: boolean;
  resolver?: Resolver;
  onNodesChange?: (nodes: SerializedNodes) => void;
  children?: React.ReactNode;
};

// Without a wrapper element, craftjs crashes.
const PlainDiv = ({ render }) => {
  const marginTop = useVerticalRhythmMargin();

  return <Box mt={marginTop}>{render}</Box>;
};

const Editor: React.FC<EditorProps> = ({
  isPreview,
  resolver,
  onNodesChange,
  children,
}) => {
  return (
    <CraftEditor
      resolver={resolver}
      indicator={{
        success: colors.green300,
        error: 'red',
        transition: 'none',
      }}
      onRender={isPreview ? PlainDiv : RenderNode}
      enabled={!isPreview}
      onNodesChange={(data) => {
        onNodesChange && onNodesChange(data.getSerializedNodes());
      }}
    >
      {children}
    </CraftEditor>
  );
};

export default Editor;
