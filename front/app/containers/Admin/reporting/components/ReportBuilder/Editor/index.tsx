import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { QueryCallbacksFor } from '@craftjs/utils';
import { Editor as CraftEditor, QueryMethods } from '@craftjs/core';

import Container from 'components/admin/ContentBuilder/Widgets/Container';

import PhaseTemplate from '../Templates/PhaseTemplate';
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
        success: 'rgb(98, 196, 98)',
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
