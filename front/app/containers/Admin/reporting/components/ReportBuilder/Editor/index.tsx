import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { Editor as CraftEditor, QueryMethods } from '@craftjs/core';
import { QueryCallbacksFor } from '@craftjs/utils';

import Container from 'components/admin/ContentBuilder/Widgets/Container';

import PhaseTemplate from '../Templates/PhaseTemplate';
import PlatformTemplate from '../Templates/PlatformTemplate';
import ProjectTemplate from '../Templates/ProjectTemplate';
import { WIDGETS } from '../Widgets';

import RenderNode from './RenderNode';

type EditorProps = {
  children: React.ReactNode;
  isPreview: boolean;
  onNodesChange?: (query: QueryCallbacksFor<typeof QueryMethods>) => void;
};

const resolver = {
  Box,
  Container,
  ...WIDGETS,
  ProjectTemplate,
  PhaseTemplate,
  PlatformTemplate,
};

// Without this, craftjs sometimes crashes.
// Not sure why. (Luuc)
const PlainDiv = ({ render }) => {
  return <div>{render}</div>;
};

const Editor: React.FC<EditorProps> = ({
  onNodesChange,
  isPreview,
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
      enabled={isPreview ? false : true}
      onNodesChange={(query) => {
        onNodesChange?.(query);
      }}
    >
      {children}
    </CraftEditor>
  );
};

export default Editor;
