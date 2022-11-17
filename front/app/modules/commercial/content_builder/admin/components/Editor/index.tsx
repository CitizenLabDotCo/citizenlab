import React from 'react';
import { SerializedNodes } from '@craftjs/core';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import BaseEditor from 'components/ContentBuilder/Editor';
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
};

const Editor: React.FC<EditorProps> = ({
  onNodesChange,
  isPreview,
  children,
}) => {
  return (
    <BaseEditor
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
      isPreview={isPreview}
      onNodesChange={onNodesChange}
    >
      {children}
    </BaseEditor>
  );
};

export default Editor;
