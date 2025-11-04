import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';

import Published from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/Published';
import Selection from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/Selection';
import Spotlight from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/Spotlight';

import AboutBox from 'components/admin/ContentBuilder/Widgets/AboutBox';
import AccordionMultiloc from 'components/admin/ContentBuilder/Widgets/AccordionMultiloc';
import ButtonMultiloc from 'components/admin/ContentBuilder/Widgets/ButtonMultiloc';
import Container from 'components/admin/ContentBuilder/Widgets/Container';
import FileAttachment from 'components/admin/ContentBuilder/Widgets/FileAttachment';
import IframeMultiloc from 'components/admin/ContentBuilder/Widgets/IframeMultiloc';
import ImageMultiloc from 'components/admin/ContentBuilder/Widgets/ImageMultiloc';
import ImageTextCards from 'components/admin/ContentBuilder/Widgets/ImageTextCards';
import TextMultiloc from 'components/admin/ContentBuilder/Widgets/TextMultiloc';
import ThreeColumn from 'components/admin/ContentBuilder/Widgets/ThreeColumn';
import TwoColumn from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';
import FolderFiles from 'components/DescriptionBuilder/Widgets/FolderFiles';
import FolderTitle from 'components/DescriptionBuilder/Widgets/FolderTitle';

import InfoWithAccordions from '.././Widgets/InfoWithAccordions';

import BaseEditor from './Editor';

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
        TextMultiloc,
        ImageMultiloc,
        IframeMultiloc,
        FileAttachment,
        AboutBox,
        AccordionMultiloc,
        WhiteSpace,
        InfoWithAccordions,
        ImageTextCards,
        ButtonMultiloc,
        Published,
        Spotlight,
        Selection,
        FolderFiles,
        FolderTitle,
      }}
      isPreview={isPreview}
      onNodesChange={onNodesChange}
    >
      {children}
    </BaseEditor>
  );
};

export default Editor;
