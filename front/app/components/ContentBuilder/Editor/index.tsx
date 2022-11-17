import React from 'react';
import {
  Editor as CraftEditor,
  SerializedNodes,
  Resolver,
} from '@craftjs/core';

// craft
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
        success: 'rgb(98, 196, 98)',
        error: 'red',
        transition: 'none',
      }}
      onRender={isPreview ? undefined : RenderNode}
      enabled={isPreview ? false : true}
      onNodesChange={(data) =>
        onNodesChange && onNodesChange(data.getSerializedNodes())
      }
    >
      {children}
    </CraftEditor>
  );
};

export default Editor;
