import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
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
