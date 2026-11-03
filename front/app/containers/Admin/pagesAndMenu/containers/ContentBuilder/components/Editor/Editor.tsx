import React, { lazy, Suspense } from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import {
  Editor as CraftEditor,
  SerializedNodes,
  Resolver,
} from '@craftjs/core';

import { ScopedDndContext } from 'components/admin/ResourceList/SortableList';

// Only the builder renders nodes through RenderNode; previews use PlainDiv.
// A static import would ship the builder's node chrome to citizen pages, which
// render the same widgets in preview mode.
const RenderNode = lazy(() => import('./RenderNode'));

type EditorProps = {
  isPreview: boolean;
  resolver?: Resolver;
  onNodesChange?: (nodes: SerializedNodes) => void;
  children?: React.ReactNode;
};

// Without this, craftjs crashes.
const PlainDiv = ({ render }) => {
  return <div>{render}</div>;
};

const LazyRenderNode = ({ render }: { render: React.ReactNode }) => (
  <Suspense fallback={null}>
    <RenderNode render={render} />
  </Suspense>
);

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
      onRender={isPreview ? PlainDiv : LazyRenderNode}
      onNodesChange={(data) => {
        onNodesChange && onNodesChange(data.getSerializedNodes());
      }}
    >
      <ScopedDndContext.Provider value={!isPreview}>
        {children}
      </ScopedDndContext.Provider>
    </CraftEditor>
  );
};

export default Editor;
