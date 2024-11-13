import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import {
  Editor as CraftEditor,
  SerializedNodes,
  Resolver,
} from '@craftjs/core';

import RenderNode from './RenderNode';

type EditorProps = {
  isPreview: boolean;
  resolver?: Resolver;
  onNodesChange?: (nodes: SerializedNodes) => void;
  children?: React.ReactNode;
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
      onRender={isPreview ? undefined : RenderNode}
      enabled={isPreview ? false : true}
      onNodesChange={(data) => {
        onNodesChange && onNodesChange(data.getSerializedNodes());
      }}
    >
      {children}
    </CraftEditor>
  );
};

export default Editor;
