import React from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { Editor as CraftEditor, SerializedNodes } from '@craftjs/core';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import Container from '../CraftComponents/Container';
import Text from '../CraftComponents/Text';
import TwoColumn from '../CraftComponents/TwoColumn';
import ThreeColumn from '../CraftComponents/ThreeColumn';
import Image from '../CraftComponents/Image';
import RenderNode from '../RenderNode';
import Iframe from '../CraftComponents/Iframe';
import AboutBox from '../CraftComponents/AboutBox';
import Accordion from '../CraftComponents/Accordion';
import WhiteSpace from '../CraftComponents/WhiteSpace';
import InfoWithAccordions from '../CraftSections/InfoWithAccordions';
import ImageTextCards from '../CraftSections/ImageTextCards';
import Button from '../CraftComponents/Button';
import AnalyticsChartWidget from '../CraftComponents/AnalyticsChartWidget';

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
        /* Reports */
        AnalyticsChartWidget,
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
