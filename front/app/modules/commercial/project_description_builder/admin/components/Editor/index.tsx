import React from 'react';
import { SerializedNodes } from '@craftjs/core';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import BaseEditor from 'components/admin/ContentBuilder/Editor';
import Container from 'components/admin/ContentBuilder/Widgets/Container';

// widgets
import Text from 'components/admin/ContentBuilder/Widgets/Text';
import TwoColumn from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import ThreeColumn from 'components/admin/ContentBuilder/Widgets/ThreeColumn';
import Image from 'components/admin/ContentBuilder/Widgets/Image';
import Iframe from 'components/admin/ContentBuilder/Widgets/Iframe';
import AboutBox from 'components/admin/ContentBuilder/Widgets/AboutBox';
import Accordion from 'components/admin/ContentBuilder/Widgets/Accordion';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';
import InfoWithAccordions from '../CraftSections/InfoWithAccordions';
import ImageTextCards from '../CraftSections/ImageTextCards';
import Button from 'components/admin/ContentBuilder/Widgets/Button';

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
