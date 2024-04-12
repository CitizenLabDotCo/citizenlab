import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';

import BaseEditor from 'components/admin/ContentBuilder/Editor';
import AccordionMultiloc from 'components/admin/ContentBuilder/Widgets/AccordionMultiloc';
import ButtonMultiloc from 'components/admin/ContentBuilder/Widgets/ButtonMultiloc';
import Container from 'components/admin/ContentBuilder/Widgets/Container';
import IframeMultiloc from 'components/admin/ContentBuilder/Widgets/IframeMultiloc';
import ImageMultiloc from 'components/admin/ContentBuilder/Widgets/ImageMultiloc';
import ImageTextCards from 'components/admin/ContentBuilder/Widgets/ImageTextCards';
import TextMultiloc from 'components/admin/ContentBuilder/Widgets/TextMultiloc';
import ThreeColumn from 'components/admin/ContentBuilder/Widgets/ThreeColumn';
import TwoColumn from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

import Events from '../CraftComponents/Events';
import HomepageBanner from '../CraftComponents/HomepageBanner';
import Projects from '../CraftComponents/Projects';
import Proposals from '../CraftComponents/Proposals';

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
        ImageMultiloc,
        IframeMultiloc,
        TextMultiloc,
        AccordionMultiloc,
        WhiteSpace,
        ImageTextCards,
        ButtonMultiloc,
        HomepageBanner,
        Projects,
        Proposals,
        Events,
      }}
      isPreview={isPreview}
      onNodesChange={onNodesChange}
    >
      {children}
    </BaseEditor>
  );
};

export default Editor;
