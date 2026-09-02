import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import {
  Editor as CraftEditor,
  SerializedNodes,
  Resolver,
} from '@craftjs/core';
import styled from 'styled-components';

import RenderNode from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Editor/RenderNode';

import { useVerticalRhythmMargin } from 'components/admin/ContentBuilder/verticalRhythm';

type EditorProps = {
  isPreview: boolean;
  resolver?: Resolver;
  onNodesChange?: (nodes: SerializedNodes) => void;
  children?: React.ReactNode;
};

// A widget can render nothing (e.g. events on a project without events) while its
// wrapper stays in the DOM; collapsing the empty wrapper stops its rhythm margin
// from showing up as a phantom gap.
const CollapsingWhenEmptyBox = styled(Box)`
  &:empty {
    display: none;
  }
`;

// Without a wrapper element, craftjs crashes.
const PlainDiv = ({ render }) => {
  const marginTop = useVerticalRhythmMargin();

  return (
    <CollapsingWhenEmptyBox mt={marginTop}>{render}</CollapsingWhenEmptyBox>
  );
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
      // DropPlacementOverlay draws the drop indicator instead: craft.js only
      // knows how to paint a plain rectangle, with no room for the reason a
      // drop is refused.
      indicator={{ style: { display: 'none' } }}
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
