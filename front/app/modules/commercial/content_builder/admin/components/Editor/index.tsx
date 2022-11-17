import React from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { Editor as CraftEditor, SerializedNodes } from '@craftjs/core';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import RenderNode from '../RenderNode';
import Container from 'components/ContentBuilder/Widgets/Container';

// widgets
import Text from 'components/ContentBuilder/Widgets/Text';
import TwoColumn from 'components/ContentBuilder/Widgets/TwoColumn';
import ThreeColumn from 'components/ContentBuilder/Widgets/ThreeColumn';
import Image from 'components/ContentBuilder/Widgets/Image';
import Iframe from 'components/ContentBuilder/Widgets/Iframe';
import AboutBox from 'components/ContentBuilder/Widgets/AboutBox';
import Accordion from 'components/ContentBuilder/Widgets/Accordion';
import WhiteSpace from 'components/ContentBuilder/Widgets/WhiteSpace';
import InfoWithAccordions from '../CraftSections/InfoWithAccordions';
import ImageTextCards from '../CraftSections/ImageTextCards';
import Button from 'components/ContentBuilder/Widgets/Button';

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
