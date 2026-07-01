import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';

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
import BaseEditor from 'components/DescriptionBuilder/Editor/Editor';
import InfoWithAccordions from 'components/DescriptionBuilder/Widgets/InfoWithAccordions';
import RichTextMultiloc from 'components/DescriptionBuilder/Widgets/RichTextMultiloc';
// BaseEditor is the generic craft.js wrapper; it only needs a resolver. It is
// shared with the (to-be-sunset) description builder for now.
import {
  ProjectPageRoot,
  ProjectPageBody,
} from 'components/ProjectPageBuilder/regions';
import EventsWidget from 'components/ProjectPageBuilder/Widgets/Events';
import InputFeed from 'components/ProjectPageBuilder/Widgets/InputFeed';
import ProjectBanner from 'components/ProjectPageBuilder/Widgets/ProjectBanner';
import ProjectTitle from 'components/ProjectPageBuilder/Widgets/ProjectTitle';
import TimelineWidget from 'components/ProjectPageBuilder/Widgets/Timeline';

type EditorProps = {
  children?: React.ReactNode;
  isPreview: boolean;
  onNodesChange?: (nodes: SerializedNodes) => void;
};

// Widget registry for the project page builder. The locked Title/Banner and the
// new Timeline/Events widgets are added here in later phases.
const Editor = ({ onNodesChange, isPreview, children }: EditorProps) => {
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
        RichTextMultiloc,
        ImageTextCards,
        ButtonMultiloc,
        TimelineWidget,
        EventsWidget,
        InputFeed,
        ProjectBanner,
        ProjectTitle,
        ProjectPageRoot,
        ProjectPageBody,
      }}
      isPreview={isPreview}
      onNodesChange={onNodesChange}
    >
      {children}
    </BaseEditor>
  );
};

export default Editor;
