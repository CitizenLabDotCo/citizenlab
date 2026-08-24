import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';

import { VerticalRhythmContext } from 'components/admin/ContentBuilder/verticalRhythm';
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
import {
  CustomPageRoot,
  CustomPageBody,
} from 'components/CustomPageBuilder/regions';
import BaseEditor from 'components/DescriptionBuilder/Editor/Editor';
import InfoWithAccordions from 'components/DescriptionBuilder/Widgets/InfoWithAccordions';
import RichTextMultiloc from 'components/DescriptionBuilder/Widgets/RichTextMultiloc';

type EditorProps = {
  children?: React.ReactNode;
  isPreview: boolean;
  onNodesChange?: (nodes: SerializedNodes) => void;
};

// AboutBox is deliberately absent: it is the project Participation Box, and resolves its
// project from the route, which a custom page does not have.
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
          AccordionMultiloc,
          WhiteSpace,
          InfoWithAccordions,
          // Migration-only bridge widget: resolvable so migrated layouts render, but
          // deliberately absent from the toolbox so admins can't add new ones.
          RichTextMultiloc,
          HtmlBlockMultiloc,
          ImageTextCards,
          ButtonMultiloc,
          PageLink,
          CustomPageRoot,
          CustomPageBody,
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
