import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';

import Container from 'components/admin/ContentBuilder/Widgets/Container';
import ImageTextCards from 'components/admin/ContentBuilder/Widgets/ImageTextCards';

import { WIDGETS } from '../Widgets';

import BaseEditor from './Editor';

type EditorProps = {
  children?: React.ReactNode;
  isPreview: boolean;
  onNodesChange?: (nodes: SerializedNodes) => void;
};

const resolver = {
  Box,
  Container,
  ImageTextCards,
  ...WIDGETS,
};

const Editor: React.FC<EditorProps> = ({
  onNodesChange,
  isPreview,
  children,
}) => {
  return (
    <BaseEditor
      resolver={resolver}
      isPreview={isPreview}
      onNodesChange={onNodesChange}
    >
      {children}
    </BaseEditor>
  );
};

export default Editor;
