import React from 'react';
// components
import { Box } from '@citizenlab/cl2-component-library';
import { Editor as CraftEditor, SerializedNodes } from '@craftjs/core';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import AboutBox from '../CraftComponents/AboutBox';
import Accordion from '../CraftComponents/Accordion';
import Button from '../CraftComponents/Button';
// craft
import Container from '../CraftComponents/Container';
import Iframe from '../CraftComponents/Iframe';
import Image from '../CraftComponents/Image';
import Text from '../CraftComponents/Text';
import ThreeColumn from '../CraftComponents/ThreeColumn';
import TwoColumn from '../CraftComponents/TwoColumn';
import WhiteSpace from '../CraftComponents/WhiteSpace';
import ImageTextCards from '../CraftSections/ImageTextCards';
import InfoWithAccordions from '../CraftSections/InfoWithAccordions';
import RenderNode from '../RenderNode';

type EditorProps = {
  children?: React.ReactNode;
  isPreview: boolean;
  onNodesChange?: (nodes: SerializedNodes) => void;
} & WithRouterProps;

const Editor: React.FC<EditorProps> = ({
  onNodesChange,
  isPreview,
  children,
}) => {
  return (
    <CraftEditor
      resolver={{
        Box,
        Container,
        TwoColumn,
        ThreeColumn,
        Text,
        Image,
        Iframe,
        AboutBox,
        Accordion,
        WhiteSpace,
        InfoWithAccordions,
        ImageTextCards,
        Button,
      }}
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

export default withRouter(Editor);
