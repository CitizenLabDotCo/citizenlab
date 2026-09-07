import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';

import { VerticalRhythmContext } from 'components/admin/ContentBuilder/verticalRhythm';
import AboutBox from 'components/admin/ContentBuilder/Widgets/AboutBox';
import AccordionMultiloc from 'components/admin/ContentBuilder/Widgets/AccordionMultiloc';
import ButtonMultiloc from 'components/admin/ContentBuilder/Widgets/ButtonMultiloc';
import Container from 'components/admin/ContentBuilder/Widgets/Container';
import FileAttachment from 'components/admin/ContentBuilder/Widgets/FileAttachment';
import HtmlBlockMultiloc from 'components/admin/ContentBuilder/Widgets/HtmlBlockMultiloc';
import IframeMultiloc from 'components/admin/ContentBuilder/Widgets/IframeMultiloc';
import ImageMultiloc from 'components/admin/ContentBuilder/Widgets/ImageMultiloc';
import ImageTextCards from 'components/admin/ContentBuilder/Widgets/ImageTextCards';
import PageLink from 'components/admin/ContentBuilder/Widgets/PageLink';
import TextMultiloc from 'components/admin/ContentBuilder/Widgets/TextMultiloc';
import ThreeColumn from 'components/admin/ContentBuilder/Widgets/ThreeColumn';
import TwoColumn from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';
import BaseEditor from 'components/DescriptionBuilder/Editor/Editor';
import InfoWithAccordions from 'components/DescriptionBuilder/Widgets/InfoWithAccordions';
import RichTextMultiloc from 'components/DescriptionBuilder/Widgets/RichTextMultiloc';
import {
  ProjectPageRoot,
  ProjectPageBody,
} from 'components/ProjectPageBuilder/regions';
import EventsWidget from 'components/ProjectPageBuilder/Widgets/Events';
import PhasesWidget from 'components/ProjectPageBuilder/Widgets/Phases';
import ProjectBanner from 'components/ProjectPageBuilder/Widgets/ProjectBanner';
import ProjectTitle from 'components/ProjectPageBuilder/Widgets/ProjectTitle';
import SpotlightSurveysWidget from 'components/ProjectPageBuilder/Widgets/SpotlightSurveys';

type EditorProps = {
  children?: React.ReactNode;
  isPreview: boolean;
  onNodesChange?: (nodes: SerializedNodes) => void;
};

const Editor = ({ onNodesChange, isPreview, children }: EditorProps) => {
  return (
    <VerticalRhythmContext.Provider value={true}>
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
          HtmlBlockMultiloc,
          ImageTextCards,
          ButtonMultiloc,
          PageLink,
          PhasesWidget,
          EventsWidget,
          // Stored layouts persist this resolver key as `resolvedName`.
          ExtraSurveysWidget: SpotlightSurveysWidget,
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
    </VerticalRhythmContext.Provider>
  );
};

export default Editor;
